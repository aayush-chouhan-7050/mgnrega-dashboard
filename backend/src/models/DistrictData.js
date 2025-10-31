import mongoose from 'mongoose';

const districtDataSchema = new mongoose.Schema({
  districtCode: {
    type: String,
    required: true,
    index: true
  },
  districtName: {
    type: String,
    required: true
  },
  state: {
    type: String,
    default: 'Chhattisgarh'
  },
  month: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  data: {
    householdsEmployed: Number,
    personDaysGenerated: Number,
    worksCompleted: Number,
    expenditure: Number,
    activeWorkers: Number,
    womenEmployment: Number
  },
  rawData: mongoose.Schema.Types.Mixed,
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

districtDataSchema.index({ districtCode: 1, year: 1, month: 1 });

export default mongoose.model('DistrictData', districtDataSchema);