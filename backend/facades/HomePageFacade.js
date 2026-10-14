const NoteRepository = require("../repositories/NoteRepository");
const NewsRepository = require("../repositories/NewsRepository");

class HomePageFacade{
    // Subsystems (Composition): the Facade uses a repository for each kind of data
    #noteRepository = new NoteRepository();
    #newsRepository = new NewsRepository();

    // Private (#): only this class can call it
    // Each link lists the roles that are allowed to see it
    #getNavLinks(role){
        const allLinks = [
            {label: "Patient", path: "/patients", roles: ["doctor", "nurse"]},
            {label: "Ward", path: "/wards", roles: ["doctor", "nurse", "pharmacist"]},
            {label: "Pharmacy", path: "/pharmacy", roles: ["doctor", "nurse", "pharmacist"]},
        ];

        // Only keep the links this role is allowed to see
        return allLinks.filter((link) => link.roles.includes(role));
    }

    #getOnCall(){
        return [];
    }

    // Ask the news subsystem for all news
    #getNews(){
        return this.#newsRepository.findAll();
    }

    // Ask the note subsystem for this user's notes
    #getNotes(userId){
        return this.#noteRepository.findByUser(userId);
    }

    // Entry point of the Facade: return all data needed for the homepage at once
    // This is the only public method (Encapsulation: hide the implementation details)
    // async: news and notes come from the database, so we need to wait for them
    async getHomePageData(role, userId){
        return {
            links: this.#getNavLinks(role),
            news: await this.#getNews(),
            onCall: this.#getOnCall(),
            notes: await this.#getNotes(userId),
        };
    }
}

module.exports = HomePageFacade;
