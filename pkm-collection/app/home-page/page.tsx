// remaining TODO list:

// Profile Page
// TODO: Display user information formatted

// Home Page
// TODO: Add prismatic evolution to new set and Describe it
// TODO: (IF TIME) make it show 3 images of the last 3 sets
// TODO: Add a welcome section

// Shop page
// TODO: Search for specific cards

// catalog page
// TODO: Search functionallity for specific cards

"use client";

// @ts-ignore
import pokemon from "pokemontcgsdk";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/lib/fireabse";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";

export default function HomePage() {
  pokemon.configure({ apiKey: process.env.API_KEY });
  const PokemonTCG = require("pokemontcgsdk");
  const BASE_URL = "https://api.pokemontcg.io/v2";

  // TODO: changes twice for some reason fix later
  const [user] = useAuthState(auth); //for items specific to the user
  const [cardImg, setCardImg] = useState("");
  const [cardId, setCardId] = useState("bw2-97");
  const [setList, setSetList] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [cardName, setCardName] = useState("");
  const [featuredSet, setFeaturedSet] = useState("");
  const [setsWithAmounts, setSetsWithAmounts] = useState<
    { setId: any; setTotal: any }[]
  >([]);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardSlides, setCardSlides] = useState<Promise<string>[]>([]);

  const getCardInfo = async (cardID: string) => {
    // setIsLoading(true);
    cardID = "swsh7-215";
    try {
      const res = await pokemon.card.find(cardID);
      setCardId(cardID);
      setCardImg(res.images.small);
      setCardName(res.name);
      setFeaturedSet(res.set.name);
      // console.log(res.images.small);
    } catch (error) {
      console.log(error);
    } finally {
      // setIsLoading(false);
    }
  };

  const getCardURL = async (cardID: string) => {
    try {
      // console.log(cardID);
      const res = await pokemon.card.find(cardID);
      return res.images.small;
    } catch (error) {
      console.log("error fetching url for carousel");
      return null;
    }
  };

  // get sets
  const fetchSets = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/sets`);
      const setsData = await response.json();
      const sets = setsData.data;
      // console.log(sets);
      const setIds = setsData.data.map((set: any) => set.id);
      setSetList(setIds);

      // for (const set of sets) {
      //   setsWithAmounts.push({ setId: set.id, setTotal: set.total });
      // }

      const newSetsWithAmounts = sets.map((set: any) => ({
        setId: set.id,
        setTotal: set.total,
      }));
      setSetsWithAmounts(newSetsWithAmounts);
      // console.log(setsWithAmounts.length);
      setIsLoading(false);
      // console.log("Fetch complete");
    } catch (error) {
      console.log("error fetching sets:", error);
    }
  };

  //TEMP SOLUTION JUST GET 9 EXs FROM ONE SET
  const fillCardSlides = async () => {
    const temp = [];
    if (setsWithAmounts.length > 0) {
      let i = 9;
      while (i > 0) {
        let randomSetIdx = Math.floor(Math.random() * setList.length);
        // console.log(randomSetIdx);

        let randomSetId = setsWithAmounts[randomSetIdx].setId;
        while (!setList.includes(randomSetId)) {
          randomSetIdx = Math.floor(Math.random() * setList.length);
          randomSetId = setsWithAmounts[randomSetIdx].setId;
        }
        // console.log(`contains ${randomSetId}`);
        let randomCardInSet = Math.floor(
          Math.random() * setsWithAmounts[randomSetIdx].setTotal,
        );
        const url = randomSetId + "-" + randomCardInSet;
        // console.log(url);
        const retrieved_url = await getCardURL(url);
        // console.log(`IM RIGHT AFTER RETRIEVED I EQUAL ${retrieved_url}`);
        if (retrieved_url !== null) {
          temp.push(retrieved_url);
          i--;
        } else {
          console.log("got null");
        }
      }
    }
    setCardSlides(temp);
  };

  useEffect(() => {
    fetchSets();
  }, []);

  useEffect(() => {
    // console.log("in the second use effect");
    if (setsWithAmounts.length > 0 && !isLoading) {
      // console.log("second use effect");
      fillCardSlides();
      // console.log(cardSlides);
    }
  }, [isLoading]);

  useEffect(() => {
    if (!isLoading) {
      const randomIdx = Math.floor(Math.random() * setList.length);
      const card = setList[randomIdx] + "-10";
      if (card !== cardId) {
        getCardInfo(card);
      }
    }
    // console.log(`here with the list of urls: ${cardSlides}`);
  }, [setList]);

  useEffect(() => {
    // console.log("cardSlidesProcessed");
    // console.log(cardSlides);
  }, [cardSlides]);

  // TODO: because we are doing index + 1 and + 2 the last two cards are out of bound and wont show properly
  const prevSlide = () => {
    const isFirstSlide = currentIndex === 0;
    const newIndex = isFirstSlide ? cardSlides.length - 1 : currentIndex - 1;
    setCurrentIndex(newIndex);
  };

  const nextSlide = () => {
    const isLastSlide = currentIndex === 6;
    const newIndex = isLastSlide ? 0 : currentIndex + 1;
    setCurrentIndex(newIndex);
  };

  return (
    <div id="homePage">
      <div
        className="mx-auto w-[1200px] border-4 border-black bg-white"
        id="body"
      >
        <div className="text-4xl font-bold text-black" id="newReleases">
          <p className="mt-8 pl-10">NEW RELEASES</p>
          <div className="w-auto flex-1 rounded-lg p-10">
            <div
              style={{
                backgroundImage: `url('/assets/prismatic.webp')`,
                width: "auto",
                height: "350px",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
              className="h-full rounded-lg bg-[#c85048] hover:scale-110"
            ></div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <hr className="border-[#a8b8c8]-500 w-[1100px] rounded-lg border-4" />
        </div>

        <div className="mb-8 mt-8 text-4xl font-bold text-black" id="featured">
          <p className="pl-10">FEATURED</p>
          <div className="mt-4 flex flex-row" id="featured-container">
            <div className="flex grow items-center justify-center">
              <img
                className="flex h-auto w-auto"
                src={cardImg}
                alt="card"
              ></img>
            </div>
            <div className="w-[800px]">
              <p>{cardName}</p>
              <p className="mt-2 text-3xl">Set: {featuredSet}</p>
              <p className="mr-9 mt-4 text-xl">
                Dubbed "Moonbreon" by the community, this card has grown in
                infamy since its debut in 2021. Highlighting the mystery and
                elegance of the VMAX giant, this card features the dark-type
                eeveelution reaching to the moon intrigued by its glowing aura.
                Using the moons energy, Umbreon launches a powerful assult with
                its attack "Max Darkness". With beauty and competitve viability,
                it is clear to see why this card joins a small elite group of
                cards that have surpassed $1000 in value.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <hr className="border-[#a8b8c8]-500 mb-4 w-[1100px] rounded-lg border-4" />
        </div>

        <div className="pb-8 text-4xl font-bold text-black" id="gallery">
          <p className="pb-8 pl-10">GALLERY</p>
          <div className="group relative m-auto h-[500px] w-full max-w-[1000px] rounded-lg border-4 border-black bg-[#a8b8c8] px-4 py-4 pt-4">
            <div className="flex h-full w-full flex-row rounded-2xl bg-[#a8b8c8] bg-center duration-500">
              <div className="w-auto flex-1 rounded-lg p-10">
                <div
                  style={{
                    backgroundImage: `url(${cardSlides[currentIndex]})`,
                    width: "auto",
                    height: "full",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                  className="h-full rounded-lg hover:scale-110"
                ></div>
              </div>

              <div className="flex-1 rounded-lg p-10">
                <div
                  style={{
                    backgroundImage: `url(${cardSlides[currentIndex + 1]})`,
                    width: "full",
                    height: "full",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                  className="h-full rounded-lg hover:scale-110"
                ></div>
              </div>

              <div className="flex-1 rounded-lg p-10">
                <div
                  style={{
                    backgroundImage: `url(${cardSlides[currentIndex + 2]})`,
                    width: "auto",
                    height: "full",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                  className="h-full rounded-lg hover:scale-110"
                ></div>
              </div>
            </div>
            <div className="absolute left-5 top-[50%] hidden -translate-x-0 translate-y-[-50%] cursor-pointer rounded-full bg-black/20 p-2 text-2xl text-white group-hover:block">
              <BsChevronCompactLeft onClick={prevSlide} size={30} />
            </div>
            <div className="absolute right-5 top-[50%] hidden -translate-x-0 translate-y-[-50%] cursor-pointer rounded-full bg-black/20 p-2 text-2xl text-white group-hover:block">
              <BsChevronCompactRight onClick={nextSlide} size={30} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
