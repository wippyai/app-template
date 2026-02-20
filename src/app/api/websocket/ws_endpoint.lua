local http = require("http")
local security = require("security")
local json = require("json")
local logger = require("logger"):named("ws_endpoint")

local CENTRAL_HUB_REGISTRY_NAME = "wippy.central"

function handler()
    local req = http.request()
    local res = http.response()

    if not req or not res then
        return nil, "Failed to get HTTP context"
    end

    if req:method() ~= http.METHOD.GET then
        res:set_status(http.STATUS.METHOD_NOT_ALLOWED)
        res:write_json({
            error = "Method not allowed",
            message = "Only GET method is supported for WebSocket connections"
        })
        return
    end

    local actor = security.actor()
    if not actor then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({
            error = "Authentication required",
            message = "This endpoint requires a valid authentication token"
        })
        return
    end

    local user_id = actor:id()
    if not user_id or user_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({
            error = "Invalid user ID",
            message = "Could not determine valid user ID from token"
        })
        return
    end

    local central_hub_pid = process.registry.lookup(CENTRAL_HUB_REGISTRY_NAME)
    if not central_hub_pid then
        res:set_status(http.STATUS.SERVICE_UNAVAILABLE)
        res:write_json({
            error = "Hub not available",
            message = "Central hub service is not running"
        })
        return
    end

    local metadata = actor:meta() or {}

    local relay_config = {
        target_pid = central_hub_pid,
        metadata = {
            user_id = user_id,
            user_metadata = metadata,
            auth_time = os.time(),
        }
    }

    local config_json, err = json.encode(relay_config)
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({
            error = "Configuration error",
            message = "Failed to encode WebSocket configuration"
        })
        return
    end

    res:set_header("X-WS-Relay", config_json)
end

return {
    handler = handler
}
