"use client";

// @ts-ignore
import pokemon from "pokemontcgsdk";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/lib/fireabse";
import { useAuth } from "@/app/context/authContext";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import {
  addDoc,
  collection,
  query,
  where,
  doc,
  getDocs,
} from "firebase/firestore";
import {
  getAuth,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail,
} from "firebase/auth";
import db from "@/app/lib/firestore";

interface CardImage {
  id: string;
  name: string;
  set: {
    name: string;
  };
  images: {
    small: string; // URL for the small image
  };
}

export default function () {
  const [groupBySet, setGroupBySet] = useState(true);
  const [groupByCard, setGroupByCard] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [setId, setSetId] = useState("");
  const [setSize, setSetSize] = useState<number>(0);
  const [pageCount, setPageCount] = useState<number>();
  const [currentPage, setCurrentPage] = useState<number>();
  const [imgArray, setImgArray] = useState<CardImage[]>([]);
  const [imgArrayChanged, setImgArrayChanged] = useState(false);
  const imgList: CardImage[] = [];
  const { user } = useAuth();

  const findPokemon = async () => {
    console.log(groupBySet);
    // retrieve a full set
    try {
      if (groupBySet) {
        const sets = await fetch("https://api.pokemontcg.io/v2/sets");
        const setsData = await sets.json();

        console.log("finding...");
        let setIdVar = null;
        let setSizeVar = 0;

        for (let i = 0; i < setsData.data.length; i++) {
          if (
            searchInput.toLowerCase() === setsData.data[i].name.toLowerCase()
          ) {
            setIdVar = setsData.data[i].id;
            setSizeVar = setsData.data[i].total;
            setSearchInput("");
            setSetId(setIdVar);
            setSetSize(setSizeVar);
            setPageCount(setSizeVar / 20 + 1);
            setCurrentPage(0);
          }
        }
      } else if (groupByCard) {
      }
    } catch (error) {
      console.log("Error finding set:", error);
    }
  };

  const fillImgList = async () => {
    try {
      console.log(`in the try ${setSize}`);
      const promises = [];
      const imgList: CardImage[] = []; // Initialize imgList here

      if (currentPage != null && setId !== "") {
        for (let i = currentPage * 20; i < (currentPage + 1) * 20; i++) {
          const url = setId + "-" + (i + 1);
          console.log(url);

          // Push each async fetch request as a promise
          if (i < setSize) {
            promises.push(
              pokemon.card.find(url).then((cardImg: CardImage) => {
                if (cardImg != null && cardImg.images.small) {
                  imgList.push(cardImg);
                }
              }),
            );
          }
        }
      }

      // Wait for all promises to resolve
      await Promise.all(promises);

      setImgArray(imgList);
    } catch (error) {
      console.log("Error fetching card images:", error);
    }
  };

  const clickCard = async (card: CardImage) => {
    console.log(`found this user: ${user?.uid}`);
    try {
      if (user) {
        const userCardData = {
          uid: user.uid,
          cardID: card.id,
          cardName: card.name,
          cardSet: card.set.name,
          cardImg: card.images.small,
        };

        const userCardCollection = collection(db, "userCards");

        const q = query(
          userCardCollection,
          where("cardID", "==", userCardData.cardID),
          where("uid", "==", userCardData.uid),
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          await addDoc(userCardCollection, userCardData);
          console.log("succesfully added to the userCard colection");
        } else {
          console.log("already in the list");
        }
      }
    } catch (err: any) {}
  };

  const handleSelect = (event: any) => {
    if (event.target.value === "set") {
      setGroupBySet(true);
      setGroupByCard(false);
    }
    if (event.target.value === "card") {
      setGroupByCard(true);
      setGroupBySet(false);
    }
  };

  useEffect(() => {
    if (setId != null) {
      console.log("in the if");
      console.log(`states set id: ${setId} and size: ${setSize}`);
      fillImgList();
    } else {
      console.log("Set not found.");
    }
  }, [currentPage, setId]);

  useEffect(() => {
    console.log(`group by card = ${groupByCard}`);
    console.log(`groub by set = ${groupBySet}`);
  }, [groupByCard]);

  return (
    <div className="mx-auto h-auto min-h-screen w-[1200px] border-4 border-black bg-white text-black">
      <div className="mb-4 mt-4 flex items-center justify-center text-4xl font-bold">
        {" "}
        <p>Explore the sets! Expand your Collection!</p>
      </div>
      <div className="mb-4 flex items-center justify-center">
        <hr className="border-[#a8b8c8]-500 w-[1100px] rounded-lg border-4" />
      </div>
      <div className="mt-6 flex flex-row justify-center">
        <div className="mx-auto flex flex-row">
          <select
            className="rounded-bl-md rounded-tl-md bg-[#70b8f0] font-bold outline outline-2 outline-black"
            name="group"
            id="group"
            onChange={handleSelect}
          >
            <option value="set">Set</option>
            <option value="card">Card</option>
          </select>
          <input
            className="w-[800px] text-black outline outline-2 outline-black"
            type="text"
            name="search"
            id="search"
            placeholder=" Search..."
            onChange={(e) => {
              setSearchInput(e.target.value);
              console.log(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                console.log("keyDown pressed");
                findPokemon();
                setSetId("");
              }
            }}
          />
          <button className="rounded-br-md rounded-tr-md bg-[#70b8f0] font-bold outline outline-2 outline-black">
            {" "}
            search
          </button>
        </div>
      </div>
      <div className="mt-10 h-full">
        <div className="flex flex-wrap justify-center gap-14">
          {imgArray.length > 0 ? (
            // Render the images if imgArray is not empty
            imgArray.map((imgSrc, index) => (
              <div
                key={index}
                className="relative flex w-[180px] flex-col rounded-lg outline outline-black hover:scale-110"
              >
                <div>
                  <button
                    onClick={() => clickCard(imgArray[index])}
                    className="absolute -right-3 -top-3 h-[40px] w-[40px] rounded-full bg-[#D3D3D3] outline outline-black hover:bg-[#A0BCAC]"
                  >
                    &#x2714;
                  </button>
                </div>
                <div
                  style={{
                    backgroundImage: imgArray[index].images.small
                      ? `url(${imgArray[index].images.small})`
                      : "none",
                    width: "150px",
                    height: "210px",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                  }}
                  className="mb-4 ml-4 mr-4 mt-4 h-full items-center justify-center rounded-lg bg-[#c85048] outline outline-red-500"
                ></div>
                <div className="mt-2 w-full max-w-[170px] break-words px-2 text-center text-sm">
                  {" "}
                  {imgArray[index].id} | {imgArray[index].name}
                </div>
              </div>
            ))
          ) : (
            // Show a loading message while imgArray is empty
            <p></p>
          )}
        </div>
        <div id="pageCounts" className="mt-10 flex flex-row justify-center">
          {pageCount != null && pageCount > 0 ? (
            // Render the images if imgArray is not empty
            Array.from({ length: pageCount }, (_, index) => (
              <div key={index}>
                <button
                  className="ml-2 mr-2"
                  onClick={() => {
                    console.log(index + 1);
                    setCurrentPage(index);
                  }}
                >
                  {index + 1}
                </button>
              </div>
            ))
          ) : (
            // Show a loading message while imgArray is empty
            <p></p>
          )}
        </div>
      </div>
    </div>
  );
}
