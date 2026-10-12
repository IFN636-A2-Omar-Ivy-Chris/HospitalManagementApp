class HomePageFacade{
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

    #getNews(){
        return [];
    }

    #getNotes(){
        return [];
    }

    // Entry point of the Facade: return all data needed for the homepage at once
    // This is the only public method (Encapsulation: hide the implementation details)
    getHomePageData(role){
        return {
            links: this.#getNavLinks(role),
            news: this.#getNews(),
            onCall: this.#getOnCall(),
            notes: this.#getNotes(),
        };
    }
}

module.exports = HomePageFacade;
