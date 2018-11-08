from flask_wtf import FlaskForm
from wtforms import FileField, IntegerField, SubmitField, SelectField, StringField, DateTimeField
# from wtforms import DateField
from wtforms_components import TimeField, DateRange
from wtforms.validators import InputRequired, NumberRange, DataRequired
from wtforms.csrf.core import CSRF
from hashlib import md5
from flask import current_app
import datetime

from wtforms.fields.html5 import DateField

SECRET_KEY = b"1234567890"

class IPAddressCSRF(CSRF):
    """
    Generate a CSRF token based on the user's IP. I am probably not very
    secure, so don't use me.
    """
    def setup_form(self, form):
        self.csrf_context = form.meta.csrf_context
        return super(IPAddressCSRF, self).setup_form(form)

    def generate_csrf_token(self, csrf_token):
        token = md5(SECRET_KEY + self.csrf_context.encode('utf-8')).hexdigest()
        return token

    def validate_csrf_token(self, form, field):
        if field.data != field.current_token:
            raise ValueError('Invalid CSRF')

class UploadForm(FlaskForm):
  file = FileField(u'File to upload:', validators=[InputRequired()])

class TextForm(FlaskForm):
  class Meta:
    csrf = True
    csrf_class = IPAddressCSRF

  node_count = IntegerField("Number of Nodes:", validators=[NumberRange(1, 3)])
  chunk_count = IntegerField("Number of 10 second chunks:", validators=[NumberRange(1, 200)])
  model_type = SelectField(
        u'Model type',
        choices = [('NN', 'nn'), ('SVM', 'svm')]
    )
  cluster_address = SelectField(
        u'Cluster address',
        choices = [('pi4', 'Pi-4'), ('pi8', 'Pi-8'), ('nuc', 'Intel NUC')]
  )
  # submit = SubmitField("Process")

class Nuts2Form(FlaskForm):
  node_count = IntegerField("Number of Nodes:", validators=[NumberRange(1, 3)])
  chunk_count = IntegerField("Number of 10 second chunks:", validators=[NumberRange(1, 200)])
  model_type = SelectField(
        u'Model type',
        choices = [('NN', 'nn'), ('SVM', 'svm')]
    )
  cluster_address = SelectField(
        u'Cluster address',
        choices = [('pi4', 'Pi-4'), ('pi8', 'Pi-8'), ('nuc', 'Intel NUC')]
  ) 

def create_data_form(start, end):
  class DateForm(FlaskForm):
      pass
  influx_ip = SelectField('Influx address: ', coerce=str, choices=[('163.221.68.191', 'Sopicha Server'), ('163.221.68.206', 'Intel NUC 1')], validators=[DataRequired()])

  cluster_address = SelectField('Cluster address: ', coerce=str, choices=[('163.221.68.242', 'Pi-4'), ('pi8', 'Pi-8'), ('163.221.68.206', 'Intel NUC')], validators=[DataRequired()])
  feature = SelectField('Feature: ', coerce=str, choices=[
    ('accel_x', 'Accel X'), 
    ('accel_y', 'Accel Y'), 
    ('accel_z', 'Accel Z'), 
    ('heat', 'Heat'), 
    ('humidity', 'Humidity'), 
    ('light', 'Light'), 
    ('noise', 'Noise'), 
    ('pressure', 'Pressure'), 
    ('temperature', 'Temperature'), 
    ('uv', 'UV')], validators=[DataRequired()])
  # st = datetime.datetime.strptime("2001-10-10 10:20:40.005", '%Y-%m-%d %H:%M:%S.%f')

  start_date = DateField('Start date', format='%Y-%m-%d', default=start)
    # , validators=[DateRange(
    #         min=start.date(),
    #         max=end.date()
    #     )])

  start_time = TimeField('Start time', default=start)

  end_date = DateField('End date', format='%Y-%m-%d', default=end)
    # , validators=[DateRange(
    #         min=start.date(),
    #         max=end.date()
    #     )])

  end_time = TimeField('End time', default=end)

  setattr(DateForm, "influx_ip", influx_ip)
  setattr(DateForm, "feature", feature)
  setattr(DateForm, "cluster_address", cluster_address)
  setattr(DateForm, "start_date", start_date)
  setattr(DateForm, "start_time", start_time)
  setattr(DateForm, "end_date", end_date)
  setattr(DateForm, "end_time", end_time)
  return DateForm()

class DateForm(FlaskForm):
  pass
