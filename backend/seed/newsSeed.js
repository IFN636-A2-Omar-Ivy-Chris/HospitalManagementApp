// Adds sample hospital news to the database
// Run from the backend folder: npm run seed:news

const mongoose = require("mongoose");
const dotenv = require("dotenv");
const News = require("../models/News");

dotenv.config();

const newsItems = [
    {
        title: "Flu vaccination clinic for staff",
        body: "Free flu vaccinations are available for all staff in Room 2.14 from Monday to Friday, 9am to 3pm.",
        publishedAt: new Date("2026-10-01"),
    },
    {
        title: "Ward B renovation starts next week",
        body: "Ward B will be closed for renovation. Patients will be moved to Ward C. Please check the ward list before admitting new patients.",
        publishedAt: new Date("2026-10-08"),
    },
    {
        title: "New hand hygiene policy for all wards, clinics and staff areas across the hospital campus",
        body: "Please use hand sanitiser before and after every patient contact. Posters with the new steps are on every ward door.",
        publishedAt: new Date("2026-10-13"),
    },
];

const seedNews = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);

        // Remove old news first, so running this script twice does not add duplicates
        await News.deleteMany({});
        await News.insertMany(newsItems);

        console.log(`${newsItems.length} news items added`);
    } catch (error) {
        console.error("Seeding news failed:", error.message);
    } finally {
        await mongoose.disconnect();
    }
};

seedNews();
