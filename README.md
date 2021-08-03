# bulletin
Customisable notifications for FiveM. Mimics native GTAV notifications, but allows more customisation

## Features
* Not external libraries - written from the groound up for FiveM
* Modern JS
* Customise the position
* Customise the look by adding your own `css` overrides to `custom.css`
* Add your own fonts
* Add your own advanced notification pictures
* Supports queueing


## Usage
### Send Notification
Using `exports`:
```lua
exports.bulletin:Send(message, timeout, position, progress, type)
```

Using `events`:

```lua
-- client
TriggerEvent("bulletin:send", message, timeout, position, progress, type)

-- server
TriggerClientEvent("bulletin:send", source, message, timeout, position, progress, type)
```

### Send Advanced Notification
Using `exports`:
```lua
exports.bulletin:SendAdvanced(message, title, subject, icon, timeout, position, progress, type)
```
Using `events`:
```lua
-- client 
TriggerEvent("bulletin:sendAdvanced", message, title, subject, icon, timeout, position, progress, type)

-- server
TriggerClientEvent("bulletin:sendAdvanced", source, message, title, subject, icon, timeout, position, progress, type)
```

## Parameters
| param      | type      | default        | options                                                                         | optional | description                                                 |
|------------|-----------|----------------|---------------------------------------------------------------------------------|----------|-------------------------------------------------------------|
| `message`  | `string`  |                |                                                                                 | NO       | The message to send                                         |
| `timeout`  | `integer` | `5000`         |                                                                                 | YES      | The duration in `ms` to display the notification            |
| `position` | `string`  | `"bottomleft"` | `"bottomleft"`, `"topleft"`, `"topright"`, `"bottomright"`, `"bottom"`, `"top"` | YES      | The postion of the notification                             |
| `progress` | `boolean` | `false`        | `true`, `false`                                                                 | YES      | Whether to display the progress of the notification timeout |
| `title`    | `string`  |                |                                                                                 | NO       | The title of the notification (advanced only)               |
| `subject`  | `string`  |                |                                                                                 | NO       | The subject / subtitle of the notification (advanced only)  |
| `icon`     | `string`  |                |                                                                                 | NO       | The picture to use (advanced only)                          |

## Default Config
```lua
Config.Timeout  = 5000
Config.Position = "bottomleft"
Config.Progress = false
Config.Queue    = 5             -- No. of notifications to show before queueing
Config.FadeTime = 500           -- The fadeIn / fadeOut time in ms

Config.Pictures = {
    -- advanced notification icons
}
```

## Custom Advanced Notification Pictures
To add your own custom picture, upload a `64x64` `jpg` image to the `ui/images` directory and add the custom code and filename to the `Config.Pictures` table in `config.lua`,

#### Example

Upload `my_custom_icon_image.jpg` to the `ui/images` directory and use `MY_CUSTOM_ICON_CODE` as the key.

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