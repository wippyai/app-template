local http = require("http")
local json = require("json")
local user_repo = require("user_repo")

local function handler()
    local req = http.request()
    local res = http.response()

    res:set_content_type(http.CONTENT.JSON)

    local user_id = req:param("id")
    if not user_id or user_id == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "User ID is required" })
        return
    end

    local body = req:body()
    if not body or body == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Request body is required" })
        return
    end

    local data, err = json.decode(body)
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "Invalid JSON: " .. err })
        return
    end

    local update_data = {}
    if data.email and data.email ~= "" then
        update_data.email = data.email
    end
    if data.full_name and data.full_name ~= "" then
        update_data.full_name = data.full_name
    end
    if data.status and data.status ~= "" then
        update_data.status = data.status
    end
    if data.password and data.password ~= "" then
        update_data.password = data.password
    end

    if not next(update_data) then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "No fields to update" })
        return
    end

    local result, err = user_repo.update(user_id, update_data)
    if err then
        res:set_status(http.STATUS.INTERNAL_ERROR)
        res:write_json({ success = false, error = err })
        return
    end

    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, result = result })
end

return { handler = handler }
