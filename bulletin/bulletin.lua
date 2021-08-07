----------------------------------------------------------------------------------------------------------------------------------------------------------------
-- Copyright © Mobius1 2021
-- ! Edit it if you want, but don't re-release this without my permission, and never claim it to be yours !

-- Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
-- to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
-- and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

-- The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
-- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
-- FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
-- WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
----------------------------------------------------------------------------------------------------------------------------------------------------------------
local notifications = {}

function Send(message, timeout, position, progress, theme)

    if message == nil then
        return PrintError("^1BULLETIN ERROR: ^7Notification message is nil")
    end

    if type(message) == "number" then
        message = tostring(message)
    end

    if not tonumber(timeout) then
        timeout = Config.Timeout
    end
    
    if position == nil then
        position = Config.Position
    end
    
    if progress == nil then
        progress = false
    end

    local duplicateID = DuplicateCheck(message)

    if duplicateID then
        SendNUIMessage({
            type = "duplicate",
            id = duplicateID
        })
    else
        local id = uuid(message)

        notifications[id] = message
    
        AddNotification({
            id          = id,
            type        = "standard",
            message     = message,
            timeout     = timeout,
            position    = position,
            progress    = progress,
            theme       = theme,
        })        
    end
end

function SendSuccess(message, timeout, position, progress)
    Send(message, timeout, position, progress, "success")
end

function SendInfo(message, timeout, position, progress)
    Send(message, timeout, position, progress, "info")
end

function SendWarning(message, timeout, position, progress)
    Send(message, timeout, position, progress, "warning")
end

function SendError(message, timeout, position, progress)
    Send(message, timeout, position, progress, "error")
end

function SendAdvanced(message, title, subject, icon, timeout, position, progress, theme)

    if message == nil then
        return PrintError("^1BULLETIN ERROR: ^7Notification message is nil")
    end

    if type(message) == "number" then
        message = tostring(message)
    end

    if title == nil then
        return PrintError("^1BULLETIN ERROR: ^7Notification title is nil")
    end
    
    if subject == nil then
        return PrintError("^1BULLETIN ERROR: ^7Notification subject is nil")
    end    

    if not tonumber(timeout) then
        timeout = Config.Timeout
    end
    
    if position == nil then
        position = Config.Position
    end
    
    if progress == nil then
        progress = false
    end  

    local id = uuid(message)

    notifications[id] = message

    AddNotification({
        id          = id,
        type        = "advanced",
        message     = message,
        title       = title,
        subject     = subject,
        icon        = Config.Pictures[icon],
        timeout     = timeout,
        position    = position,
        progress    = progress,
        theme       = theme,
    })
end

function AddNotification(data)
    data.config = Config
    SendNUIMessage(data)
end

function PrintError(message)
    local s = string.rep("=", string.len(message))
    print(s)
    print(message)
    print(s)  
end

function DuplicateCheck(message)
    for id, msg in pairs(notifications) do
        if msg == message then
            return id
        end
    end

    return false
end

function uuid(message)
    math.randomseed(GetGameTimer() + string.len(message))
    local template ='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'
    return string.gsub(template, '[xy]', function (c)
        local v = (c == 'x') and math.random(0, 0xf) or math.random(8, 0xb)
        return string.format('%x', v)
    end)
end

RegisterNetEvent("bulletin:send")
AddEventHandler("bulletin:send", Send)

RegisterNetEvent("bulletin:sendAdvanced")
AddEventHandler("bulletin:sendAdvanced", SendAdvanced)

RegisterNetEvent("bulletin:sendSuccess")
AddEventHandler("bulletin:sendSuccess", SendSuccess)

RegisterNetEvent("bulletin:sendInfo")
AddEventHandler("bulletin:sendInfo", SendInfo)

RegisterNetEvent("bulletin:sendWarning")
AddEventHandler("bulletin:sendWarning", SendWarning)

RegisterNetEvent("bulletin:sendError")
AddEventHandler("bulletin:sendError", SendError)

RegisterNUICallback("nui_removed", function(data, cb)
    notifications[data.id] = nil
    cb('ok')
end)