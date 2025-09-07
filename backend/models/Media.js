// backend/models/Media.js
const mongoose = require('mongoose');

const mediaSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'My Composition'
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  mediaFiles: [{
    type: {
      type: String,
      enum: ['image', 'video'],
      required: true
    },
    filename: String,
    url: String,
    // Direct properties for editor (not nested)
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: { type: Number, default: 200 },
    height: { type: Number, default: 150 },
    rotation: { type: Number, default: 0 },
    isBackground: { type: Boolean, default: false }
  }],
  compositionType: {
    type: String,
    enum: ['pip', 'piv', 'custom'],
    default: 'custom'
  },
  elements: [{
    id: String,
    type: {
      type: String,
      enum: ['text', 'rect', 'circle', 'image'],
      required: true
    },
    text: String,
    x: { type: Number, default: 0 },
    y: { type: Number, default: 0 },
    width: Number,
    height: Number,
    fontSize: Number,
    fontFamily: String,
    fill: String,
    stroke: String,
    strokeWidth: Number,
    shadowColor: String,
    shadowBlur: Number,
    shadowOffset: {
      x: Number,
      y: Number
    },
    opacity: Number,
    draggable: Boolean,
    rotation: Number,
    scaleX: Number,
    scaleY: Number
  }],
  backgroundColor: {
    type: String,
    default: '#ffffff'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Media', mediaSchema);