----------------------------------------------------------------------------------------------------------------------------------------------------------------
-- * Bulletin
-- * Copyright (c) 2021 Karl Saunders (Mobius1)
-- * Licensed under GPLv3

-- * Version: 1.1.9
--
-- ! Edit it if you want, but don't re-release this without my permission, and never claim it to be yours !

-- Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"),
-- to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense,
-- and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

-- The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
    
-- THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
-- FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
-- WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
----------------------------------------------------------------------------------------------------------------------------------------------------------------
math.randomseed(GetGameTimer())

local notifications = {}

--[[
-- Send standard notification 
-- @param message [string | table] The notification message or table of options
-- @param timeout [integer] The time in ms to display the notification
-- @param position [string] The notification position
-- @param progress [boolean] Display progress bar
-- @param theme [string] The notification theme
-- @param exitAnim [string] The animation used to hide the notification
-- @param flash [boolean] Make the notification blink
-- @param pin_id [string] Unique UUID for pinning
-- @return void
]]
function Send(message, timeout, position, progress, theme, exitAnim, flash, pin_id)
    
    if type(message) == 'table' then
        SendCustom(message)
        return
    end

    if message == nil then
        return PrintError("^1BULLETIN ERROR: ^7Notification message is nil")
    end

    message = tostring(message)

    if not tonumber(timeout) then
        timeout = Config.Timeout
    end
    
    if position == nil then
        position = Config.Position
    end
    
    if progress == nil then
        progress = Config.Progress
    end

    local id = nil
    local duplicateID = DuplicateCheck(message)

    if duplicateID then
        id = duplicateID
    else
        id = uuid(message)
        notifications[id] = message
    end
    
    AddNotification({
        duplicate   = duplicateID ~= false,
        id          = id,
        type        = "standard",
        message     = message,
        timeout     = timeout,
        position    = position,
        progress    = progress,
        theme       = theme,
        exitAnim    = exitAnim,
        flash       = flash,
        pin_id      = pin_id,
    })        

end

--[[
-- Send advanced notification 
-- @param message [string | table] The notification message or table of options
-- @param title [string] The title of the notification
-- @param subject [string] The subtitle of the notification
-- @param icon [string] The icon of the notification
-- @param timeout [integer] The time in ms to display the notification
-- @param position [string] The notification position
-- @param progress [boolean] Display progress bar
-- @param theme [string] The notification theme
-- @param exitAnim [string] The animation used to hide the notification
-- @param flash [boolean] Make the notification blink
-- @param pin_id [string] Unique UUID for pinning
-- @return void
]]
function SendAdvanced(message, title, subject, icon, timeout, position, progress, theme, exitAnim, flash, pin_id)

    if type(message) == 'table' then
        SendCustom(message, true)
        return
    end

    if message == nil then
        return PrintError("^1BULLETIN ERROR: ^7Notification message is nil")
    end

    message = tostring(message)

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
        progress = Config.Progress
    end  

    local id = nil
    local duplicateID = DuplicateCheck(message)

    if duplicateID then
        id = duplicateID
    else
        id = uuid(message)
        notifications[id] = message
    end

    AddNotification({
        duplicate   = duplicateID ~= false,
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
        exitAnim    = exitAnim,
        flash       = flash,
        pin_id      = pin_id,
    })
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

--[[
-- Sends a pinned notification    
-- @param options [table]
-- @return [string] uuid
]]
function SendPinned(options)
    local pin_id = uuid()
    options.pin_id = pin_id

    SendCustom(options)

    return pin_id
end

--[[
-- Unpins notifications   
-- @param pinned [string | table | nil]
-- @return void
]]
function Unpin(pinned)
    SendNUIMessage({
        type = 'unpin',
        pin_id = pinned
    })
end

function UpdatePinned(pinned, options)
    if options.icon ~= nil then
        options.icon = Config.Pictures[options.icon]
    end

    SendNUIMessage({
        type = 'update_pinned',
        pin_id = pinned,
        options = options
    })
end

--[[
-- Send custom notification   
-- @param options [table]
-- @param advanced [boolean]
-- @return void
]]
function SendCustom(options, advanced)
    if type(options) ~= 'table' then
        error("BULLETIN ERROR: options passed to `SendCustom` must be a table")
    end
    if options.type == "standard" or options.type == nil and not advanced then
        Send(options.message, options.timeout, options.position, options.progress, options.theme, options.exitAnim, options.flash, options.pin_id)
    elseif advanced ~= nil or options.type == "advanced" then
        SendAdvanced(options.message, options.title, options.subject, options.icon, options.timeout, options.position, options.progress, options.theme, options.exitAnim, options.flash, options.pin_id)
    end
end

--[[
-- Send notification data to NUI   
-- @param data [table]
-- @return void
]]
function AddNotification(data)
    data.config = Config
    SendNUIMessage(data)
end

--[[
-- Prints error to console   
-- @param message [string]
-- @return void
]]
function PrintError(message)
    local s = string.rep("=", string.len(message))
    print(s)
    print(message)
    print(s)  
end

--[[
-- Checks for duplicate notification   
-- @param message [string]
-- @return [string | boolean]
]]
function DuplicateCheck(message)
    for id, msg in pairs(notifications) do
        if msg == message then
            return id
        end
    end

    return false
end

--[[
-- Generates unique UUID   
-- @param message [string]
-- @return [string] UUID
]]
function uuid()
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

RegisterNetEvent("bulletin:sendPinned")
AddEventHandler("bulletin:sendPinned", SendPinned)

RegisterNetEvent("bulletin:unpin")
AddEventHandler("bulletin:unpin", Unpin)

RegisterNetEvent("bulletin:updatePinned")
AddEventHandler("bulletin:updatePinned", UpdatePinned)

RegisterNUICallback("nui_removed", function(data, cb)
    notifications[data.id] = nil
    cb('ok')
end)
