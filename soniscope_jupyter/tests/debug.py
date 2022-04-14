# run as `python -m sonivis_lens_widget.tests.debug`

from ..lens_widget import LensWidget
import pandas as pd

daily_file = r'c:\Users\arind\Documents\scm\sonivis-jupyter\BikeData\day.csv'
daily = pd.read_table(daily_file, sep=',')  # , low_memory=False
print(daily.head(3))
print('\n')

w = LensWidget()
print()
print(w._marks_x)
print(w.x_field)
print()
w.set_data(daily, 'temp', 'hum')
print(w.data)
print()
print(w._marks_x)
print()
print("#" + w.x_field + "#")

# w.set_data(daily, 'hello', 'foo')

w2 = LensWidget(daily, 'temp', 'hum')
