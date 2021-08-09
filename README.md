# bulletin
Customisable notifications for FiveM. Mimics native GTAV notifications, but allows more customisation

## Features
* No external libraries
* Modern JS - no jQuery bloat
* Customisable screen position
* Customise the look by adding your own `css` overrides to `ui/css/custom.css`
* Animated auto-arrange
* Supports default GTA:V and custom notification pictures
* Supports queueing
* Supports stacking
* Supports color codes (`~r~`, `~b~`, `~h~`, etc)
* Supports HTML as message

## Demo Videos
* [Themes](https://streamable.com/pikxny)
* [Positions](https://streamable.com/v3pgjw)
* [Animated auto-arrange](https://streamable.com/42myjy)
* [Queued](https://streamable.com/2jbmle)
* [Stacking](https://streamable.com/u6amog)
* [Custom Pics](https://streamable.com/qrn3ww)
* [Formatting](https://streamable.com/eziwiu)

## Table of Contents
* [Usage](#usage)
* [Events](#events)
* [Parameters](#parameters)
* [Default Config](#default-config)
* [Custom Notification Pictures](#custom-notification-pictures)
* [Formatting](#formatting)
* [ESX Overrides](#esx-overrides)
* [To Do / Planned](#to-do---planned)

## Usage
```lua
-- Send standard notification
exports.bulletin:Send(message, timeout, position, progress, theme)

-- Send advanced notification
exports.bulletin:SendAdvanced(message, title, subject, icon, timeout, position, progress, theme)

-- Send standard success notification
exports.bulletin:SendSuccess(message, timeout, position, progress)

-- Send standard info notification
exports.bulletin:SendInfo(message, timeout, position, progress)

-- Send standard warning notification
exports.bulletin:SendWarning(message, timeout, position, progress)

-- Send standard error notification
exports.bulletin:SendError(message, timeout, position, progress)
```

## Events
All methods can be triggered from both the client and server:

```lua
-- Send standard notification
TriggerEvent("bulletin:send", message, timeout, position, progress, theme)

-- Send advanced notification
TriggerEvent("bulletin:sendAdvanced", message, title, subject, icon, timeout, position, progress, theme)

-- Send standard success notification
TriggerEvent("bulletin:sendSuccess", message, timeout, position, progress)

-- Send standard info notification
TriggerEvent("bulletin:sendInfo", message, timeout, position, progress)

-- Send standard warning notification
TriggerEvent("bulletin:sendWarning", message, timeout, position, progress)

-- Send standard error notification
TriggerEvent("bulletin:sendError", message, timeout, position, progress)
```

Remember, when triggering from server-sided script, you must add the `source` param:

```lua
-- client side
TriggerEvent('bulletin:send', message, timeout, position, progress, theme)

--server side
TriggerClientEvent('bulletin:send', source, message, timeout, position, progress, theme)
```

## Parameters
| param      | type      | default        | options                                                                                     | optional | description                                                 |
|------------|-----------|----------------|---------------------------------------------------------------------------------------------|----------|-------------------------------------------------------------|
| `message`  | `string`  |                |                                                                                             | NO       | The message to send. Can be a string or valid HTML                                         |
| `timeout`  | `integer` | `5000`         |                                                                                             | YES      | The duration in `ms` to display the notification            |
| `position` | `string`  | `"bottomleft"` | `"bottomleft"`, `"topleft"`, `"topright"`, `"bottomright"`, `"bottom"`, `"top"`             | YES      | The postion of the notification                             |
| `progress` | `boolean` | `false`        | `true`, `false`                                                                             | YES      | Whether to display the progress of the notification timeout |
| `theme`    | `string`  | `"default"`    | `"default"`, `"success"`, `"info"`, `"warning"`, `"error"`                                  | YES      | The theme of the notification                               |
| `title`    | `string`  |                |                                                                                             | NO       | The title of the notification (advanced only)               |
| `subject`  | `string`  |                |                                                                                             | NO       | The subject / subtitle of the notification (advanced only)  |
| `icon`     | `string`  |                |                                                                                             | NO       | The picture to use (advanced only)                          |

## Default Config
```lua
Config.Timeout          = 5000          -- Overridden by the `timeout` param
Config.Position         = "bottomleft"  -- Overridden by the `position` param
Config.Progress         = false         -- Overridden by the `progress` param
Config.Theme            = "default"     -- Overridden by the `theme` param
Config.Queue            = 5             -- No. of notifications to show before queueing
Config.Stacking         = true          -- Enables / disables stacking
Config.ShowStackedCount = true          -- When enabled, will show stacked count in corner of notification
Config.AnimationOut     = "fadeOut";    -- Exit animation - 'fadeOut', 'fadeOutLeft', 'flipOutX', 'flipOutY', 'bounceOutLeft', 'backOutLeft', 'slideOutLeft', 'zoomOut', 'zoomOutLeft'
Config.AnimationTime    = 500           -- Entry / exit animation interval
Config.SoundFile        = false         -- Sound file stored in ui/audio used for notification sound. Leave as false to disable.
Config.SoundVolume      = 0.4           -- 0.0 - 1.0

Config.Pictures = {
    -- advanced notification icons
}
```

## Custom Notification Pictures
To add your own custom picture, upload a `64x64` `jpg` image to the `ui/images` directory and add the custom code and filename to the `Config.Pictures` table in `config.lua`,

#### Example

Upload `my_custom_icon_image.jpg` to the `ui/images` directory and use `MY_CUSTOM_ICON_CODE` (NO SPACES!) as the key.

```lua
Config.Pictures = {
    ...
    MY_CUSTOM_ICON_CODE = "my_custom_icon_image.jpg" -- Add this
}
```

Then use the custom code in the notification call:

```lua
exports.bulletin:SendAdvanced("Message", "Title", "Subject", "MY_CUSTOM_ICON_CODE")
```

## Formatting
Bulletin supports the following formatting:

```lua
\n = new line
~r~ = Red
~b~ = Blue
~g~ = Green
~y~ = Yellow
~p~ = Purple
~o~ = Orange
~u~ = Black
~s~ / ~w~ = White
~h~ = Bold Text
```

You can also use HTML for colors:

```lua
exports.bulletin:Send("<span class='r'>I am red</span> and <span class='y'>I am yellow</span>")
```

## ESX Overrides
If you're using `ESX` then you can get `bulletin` to override the notifications by editing the appropriate functions in `es_extended/client/functions.lua`:

```lua
ESX.ShowNotification = function(msg)
    -- SetNotificationTextEntry('STRING')
    -- AddTextComponentString(msg)
    -- DrawNotification(0,1)
	
    exports.bulletin:Send(msg)
end

ESX.ShowAdvancedNotification = function(sender, subject, msg, textureDict, iconType, flash, saveToBrief, hudColorIndex)
    -- if saveToBrief == nil then saveToBrief = true end
    -- AddTextEntry('esxAdvancedNotification', msg)
    -- BeginTextCommandThefeedPost('esxAdvancedNotification')
    -- if hudColorIndex then ThefeedNextPostBackgroundColor(hudColorIndex) end
    -- EndTextCommandThefeedPostMessagetext(textureDict, textureDict, false, iconType, sender, subject)
    -- EndTextCommandThefeedPostTicker(flash or false, saveToBrief)
	
    exports.bulletin:SendAdvanced(msg, sender, subject, textureDict)
end
```

## To Do / Planned
- [ ] Reduce number of params in favour of table of options
- [x] Support stacking
- [x] Support notification sound
- [ ] Support pinned notifications
- [ ] Support user-defined entry animations (currently only supports exit animations)

<br><br><br><h3 align='center'>Legal Notices</h2>
<table><tr><td>
bulletin  

Copyright (C) 2021  Mobius1


This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.  


This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.  


You should have received a copy of the GNU General Public License
along with this program.  
If not, see <https://www.gnu.org/licenses/>
</td></tr>
</table>