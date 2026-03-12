local json = require("json")

local function handler(params)
    local title = params.title or "Untitled Artifact"
    local display_type = params.display_type or "inline"

    local artifact = {
        title = title,
        display_type = display_type,
        preview = params.preview or "",
        instructions = false,  -- Use standalone artifact message, not inline tag
    }

    if params.tag_name then
        -- Web component mode: content is JSON props for the component
        artifact.tag_name = params.tag_name
        artifact.content_type = "application/json"

        if params.props and type(params.props) == "table" then
            local encoded, err = json.encode(params.props)
            if err then
                return { success = false, error = "Failed to encode props: " .. tostring(err) }
            end
            artifact.content = encoded
        elseif params.content then
            artifact.content = params.content
        else
            artifact.content = "{}"
        end
    else
        -- Content mode: HTML or Markdown
        artifact.content = params.content or ""
        artifact.content_type = params.content_type or "text/markdown"
    end

    return {
        success = true,
        message = "Artifact created: " .. title,
        _control = {
            artifacts = { artifact }
        }
    }
end

return { handler = handler }
