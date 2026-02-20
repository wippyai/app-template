local http = require("http")
local security = require("security")
local time = require("time")

local GUEST_GROUP = "app.security:user"
local TOKEN_STORE_ID = "userspace.user.security:tokens"
local TOKEN_EXPIRATION = "24h"

local function handler()
    local res = http.response()
    res:set_content_type("text/html")

    local nano = time.now():unix_nano()
    local user_id = string.format("guest_%016x", nano)

    local actor = security.new_actor(user_id, {
        user_id = user_id,
        is_guest = true,
        security_groups = { GUEST_GROUP },
    })

    local scope, err = security.named_scope(GUEST_GROUP)
    if not scope then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write("Failed to get security scope: " .. tostring(err))
        return
    end

    local token_store, err = security.token_store(TOKEN_STORE_ID)
    if not token_store then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write("Failed to get token store: " .. tostring(err))
        return
    end

    local auth_token, err = token_store:create(actor, scope, {
        expiration = TOKEN_EXPIRATION,
        meta = { is_guest = true },
    })
    token_store:close()

    if not auth_token then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write("Failed to create token: " .. tostring(err))
        return
    end

    res:set_status(http.STATUS.OK)
    res:write([[<!DOCTYPE html>
<html><head><title>Logging in...</title></head>
<body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#f8fafc;color:#64748b">
<p>Logging in...</p>
<script>
localStorage.setItem('@wippy_token_info', JSON.stringify({token:"]] .. auth_token .. [["}));
window.location.href='/';
</script>
</body></html>]])
end

return { handler = handler }
