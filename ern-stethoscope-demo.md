# SoniScope Demo for ERN 2023 using Touch with a Stethoscope

## Classical Interactions

rect.overlay
  mouseenter  --> lens opacity = default;
  mouseleave  --> lens opacity = 0;
  wheel       --> resize lens
  mousemove 	--> set lens coords
  pointerdown --> send event (play sonification)

## Stethoscope Interactions

rect.overlay
  wheel       --> resize lens
  pointerdown --> send event (play sonification)
                  set lens coords
                  lens opacity = default;
                  transition
                      lens opacity = 0;

## Windows integrated touch feedback

Erleichterte Bedienung > Mauszeiger > Touchfeedback ändern
<https://www.randombrick.de/windows-10-visuelles-feedback-fuer-touchscreen-deaktivieren/>
