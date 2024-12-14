# Comp5130
COMP.5130 Internet and web systems - Fall 2024 project

**User Documentation**

PKM-Collection is a web application for dedicated collectors and fans of the Pokemon Trading Card Game. Here collectors will be able to track there collections with cards from sets across the generations. Grow and build the collection buy purchasing and selling cards to other users. While on the application, users can check out featured card arts and upcoming sets as well.

- **Home page** - Explore the art gallery that highlights cards from years past, enjoy the featured card and learn more about a top card in todays market, and finally see whats new in the world of Pokemon TCG
- **Shop page** - buy cards that are listed on the page, all purchases will be immideately placed in the cart page to review and finalize purchases (payment methods not yet implemented). Any urchases made will immediately add the cards to your digital collection while you wait for the physical card to arrive.
- **Catalog Page** - populate your collection with cards you already own or checkout cards from all previous sets. Simply input a set name and see all cards belonging to that set.
- **Profile Page** - Rgeister and Login to get access to the profile page where the user can see their collection in its entirety. Here users can sell there cards and post to the shop page.

**API Documentation**

- PKM-Collection relies on the PokemonTCG API (https://pokemontcg.io/) to retreive card Data. The API calls specifically retreive Card Image urls, set Names, IDs, card Names, etc. The API Boasts more usefull attributes associated with each card, but fofr simplicity only the mentioned attributes are retrieved. This data is then transformed into new objects that are then stored in Google Firebase Databases. Sample API calls include:

  pokemon.card.find(url).then((cardImg: CardImage) => {
                if (cardImg != null && cardImg.images.small) {
                  imgList.push(cardImg);
                }
              }),
