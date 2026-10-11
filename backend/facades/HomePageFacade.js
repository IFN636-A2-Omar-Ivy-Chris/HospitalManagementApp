class HomePageFacade{
    getNavLinks(){
        return [
            {label: "Patient", path: "/patients"},
            {label: "Ward", path: "/wards"},
            {label: "Pharmacy", path: "/pharmacy"},
        ];
    }

    getNews(){
        return [];
    }

    getOnCall(){
        return [];
    }

    getNotes(){
        return [];
    }

    // Entry point of the Facade: return all data needed for the homepage at once
    getHomePageData(){
        return {
            links: this.getNavLinks(),
            news: this.getNews(),
            onCall: this.getOnCall(),
            notes: this.getNotes(),
        };
    }
}

module.exports = HomePageFacade;