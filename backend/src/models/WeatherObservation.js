import mongoose from 'mongoose';

const weatherObservationSchema = new mongoose.Schema(
  {
    field: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Field',
      required: true,
      index: true,
    },
    year: {
      type: Number,
      required: true,
      min: 2000,
      max: 2100,
    },
    averageTemperature: {
      type: Number,
      required: true,
    },
    precipitationMm: {
      type: Number,
      required: true,
      min: 0,
    },
    humidity: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    source: {
      type: String,
      trim: true,
      maxlength: 120,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

weatherObservationSchema.index({ field: 1, year: 1 }, { unique: true });

export default mongoose.model('WeatherObservation', weatherObservationSchema);