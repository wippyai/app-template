local ctx = require("ctx")

local USER_HUB_PREFIX = "user."

local PAGES: {[string]: string} = {
    home = "/",
    users = "/users",
}

local function handler(params)
    local user_id = ctx.get("user_id")
    if not user_id then
        return { error = "User context not available" }
    end

    if not params.page or params.page == "" then
        return { error = "page is required" }
    end

    local path = PAGES[params.page]
    if not path then
        local valid = {}
        for k, _ in pairs(PAGES) do
            table.insert(valid, k)
        end
        return { error = "Unknown page: " .. params.page .. ". Valid pages: " .. table.concat(valid, ", ") }
    end

    local hub_pid = process.registry.lookup(USER_HUB_PREFIX .. user_id)
    if hub_pid then
        process.send(hub_pid, "action:navigate", { path = path })
    end

    return {
        success = true,
        message = "Navigated to " .. params.page,
        page = params.page,
        path = path,
    }
end

return { handler = handler }
