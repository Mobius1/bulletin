# bulletin
Customisable notifications for FiveM. Mimics native GTAV notifications, but allows more customisation

## Features
* No external libraries - written from the ground up for FiveM
* Modern JS - no jQuery bloat
* Supports default GTA:V and custom notification pictures
* Customisable screen position
* Customise the look by adding your own `css` overrides to `ui/css/custom.css`
* Add your own fonts
* Supports queueing

## Demo Videos
* [Themes](https://streamable.com/pikxny)
* [Positions](https://streamable.com/v3pgjw)
* [Queued](https://streamable.com/2jbmle)
* [Custom Pics](https://streamable.com/qrn3ww)


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
| `message`  | `string`  |                |                                                                                             | NO       | The message to send                                         |
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
Config.AnimationOut     = "fadeOut";    -- Exit animation
Config.AnimationTime    = 500           -- Entry / exit animation interval

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

## To Do / Planned
* Reduce number of params in favour of table of options
* Support notification sound
* Support user-defined entry animations (currently only supports exit animations)

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