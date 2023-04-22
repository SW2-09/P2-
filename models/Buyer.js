export {Buyer}
import mongoose from 'mongoose';

const buyerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    jobs_computed: {
        type: Number,
        default: 0
    },
    jobs:{
        type: Object,
        default: null,
    }
})

const Buyer = mongoose.model('Buyer', buyerSchema);
