const HomePageFacade = require("../facades/HomePageFacade");

const homePageFacade = new HomePageFacade();

const getHomePage = async (req, res) => {
    try {
        // Controller only calls Facade, without knowing the details of how the data is fetched or structured
        // req.user is set by the protect middleware (from the login token)
        const data = await homePageFacade.getHomePageData(req.user.role, req.user.id);

        res.status(200).json(data);
    } catch (error) {
        console.error("Error loading home page:", error);

        res.status(500).json({
            message: "Server error",
        });
    }
};

module.exports = { getHomePage };
