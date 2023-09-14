# SoniScope Demo for ERN 2023 using Touch with a Stethoscope

Interactions are captured on `rect.overlay` as defined in `lensCursor.ts`.

## Classical Interactions

* mouseenter  --> lens opacity = default
* mouseleave  --> lens opacity = 0
* wheel       --> resize lens
* mousemove 	--> set lens coords
* mousedown   --> send event (play sonification)

## Stethoscope Touch Interactions

* touchstart  --> send event (play sonification)
                  set lens coords
                  lens opacity = default
* touchend    --> lens opacity transitions to 0
* wheel       --> resize lens

## Windows Settings

* disable integrated touch feedback:
  * Erleichterte Bedienung > Mauszeiger > Touchfeedback ändern
    <https://www.randombrick.de/windows-10-visuelles-feedback-fuer-touchscreen-deaktivieren/>
* disable long touch as right click
  * Search "Finger" and open "Fingereingabeeinstellungen" in search results
* Firefox Web Browser also translates a long touch to a right click independently from Windows.
