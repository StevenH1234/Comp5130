"use client";

// @ts-ignore
import pokemon from "pokemontcgsdk";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { auth } from "@/app/lib/fireabse";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { useAuth } from "@/app/context/authContext";
import {
  collection,
  query,
  where,
  doc,
  getDocs,
  deleteDoc,
  addDoc,
} from "firebase/firestore";
import db from "../lib/firestore";

interface Card {
  id: string;
  name: string;
  set: {
    name: string;
  };
  images: {
    small: string; // URL for the small image
  };
}

export default function HomePage() {
  const [displayName, setDisplayName] = useState("");
  const [userCardImgs, setUserCardImgs] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card>();
  const [selectedCardPrice, setSelectedCardPrice] = useState<number>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const { user } = useAuth();

  const getUsername = async () => {
    if (user) {
      const q = query(collection(db, "userData"), where("uid", "==", user.uid));

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const userData = querySnapshot.docs[0].data();
        return userData.username;
      }
    }
    return null;
  };

  const extractCards = async () => {
    console.log("in function");
    if (user) {
      console.log("made it past the first if");
      const q = query(
        collection(db, "userCards"),
        where("uid", "==", user.uid),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        console.log("in the second if");
        const temp: Card[] = [];
        querySnapshot.forEach((entry) => {
          const cardData = entry.data();
          const myCard: Card = {
            id: cardData.cardID,
            name: cardData.cardName,
            set: {
              name: cardData.cardSet,
            },
            images: {
              small: cardData.cardImg,
            },
          };
          temp.push(myCard);
        });
        setUserCardImgs(temp);
      }
    } else {
      console.log("no user");
    }
  };

  const onConfirmSale = async () => {
    if (selectedCardPrice != null && selectedCardPrice > 0) {
      //push to the public sales collection firebase
      console.log(selectedCardPrice);
      const saleObj = {
        cardId: selectedCard?.id,
        cardImg: selectedCard?.images.small,
        cardName: selectedCard?.name,
        price: selectedCardPrice,
        seller: displayName,
        setName: selectedCard?.set.name,
      };

      const publicShop = collection(db, "publicShop");

      //check if already in the db
      const q = query(
        publicShop,
        where("cardId", "==", saleObj.cardId),
        where("seller", "==", saleObj.seller),
      );

      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        await addDoc(publicShop, saleObj);
        console.log("succesfully listed card on shop");
      } else {
        console.log("could not post");
      }

      // back to profile page
      setIsModalVisible(false);
    } else {
      console.log("please add a price");
    }
  };

  const removeFromCollection = async (userCard: Card, index: number) => {
    try {
      const userCardsRef = collection(db, "userCards");

      const q = query(userCardsRef, where("cardID", "==", userCard.id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (entrySnapShot) => {
          const entryRef = doc(db, "userCards", entrySnapShot.id);
          setUserCardImgs((prevCards) => {
            const updatedCards = [...prevCards];
            updatedCards.splice(index, 1);
            return updatedCards;
          });
          await deleteDoc(entryRef);
          console.log("deleted");
        });
      } else {
        console.log("no docs to delete");
      }
    } catch (e) {
      console.error("error deleting");
    }
  };

  const handlePriceChange = (e: any) => {
    setSelectedCardPrice(parseFloat(e.target.value));
  };

  const onSell = (card: Card) => {
    setSelectedCard(card);
    setIsModalVisible(true);
  };

  // use effect to call a function to populate the list
  useEffect(() => {
    console.log("first arrived on page");
    extractCards();
  }, []);

  useEffect(() => {
    console.log(userCardImgs);
  }, [userCardImgs]);

  useEffect(() => {
    const fetchUserName = async () => {
      if (user) {
        const displayName = await getUsername();
        if (displayName != null) {
          console.log(`DIsplay name is ${displayName}`);
          setDisplayName(displayName);
        } else {
          setDisplayName("error");
        }
      } else {
        setDisplayName("Guest");
      }
    };

    extractCards();
    fetchUserName();
  }, [user]);

  return (
    <div id="homePage">
      <div
        className="mx-auto min-h-screen w-[1200px] border-4 border-black bg-white text-black"
        id="body"
      >
        <div className="pl-6 pt-10 text-5xl font-bold text-black">
          Trainer: {displayName}
        </div>
        <div
          className="mb-8 mt-8 pl-6 text-5xl font-bold text-black"
          id="My Colecction"
        >
          My Collection
        </div>
        <div className="mb-8 flex items-center justify-center">
          <hr className="border-[#a8b8c8]-500 w-[1100px] rounded-lg border-4" />
        </div>
        <div className="flex items-center justify-center pb-4">
          <div className="flex w-[1150px] flex-wrap justify-center gap-14 rounded-xl border-4 border-black bg-[#a8b8c8] py-4">
            {userCardImgs.length > 0 ? (
              userCardImgs.map((card, index) => (
                <div
                  key={index}
                  className="relative flex w-[180px] flex-col rounded-lg hover:scale-110"
                >
                  <div>
                    <button
                      onClick={() => {
                        removeFromCollection(userCardImgs[index], index);
                      }}
                      className="absolute -right-3 -top-3 h-[40px] w-[40px] rounded-full bg-[#D3D3D3] font-bold outline outline-black hover:bg-[#c85048]"
                    >
                      X
                    </button>
                  </div>
                  <div
                    style={{
                      backgroundImage: userCardImgs[index].images.small
                        ? `url(${userCardImgs[index].images.small})`
                        : "none",
                      width: "150px",
                      height: "210px",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                    className="mb-4 ml-4 mr-4 mt-4 h-full items-center justify-center rounded-lg bg-[#c85048] outline outline-black"
                  ></div>
                  <button
                    className="w-full rounded-md bg-[#c85048] font-bold text-white hover:scale-110"
                    onClick={() => {
                      onSell(userCardImgs[index]);
                    }}
                  >
                    SELL
                  </button>
                  <div className="mt-2 w-full max-w-[170px] break-words px-2 text-center text-sm">
                    {" "}
                    {userCardImgs[index].id} | {userCardImgs[index].name}
                  </div>
                </div>
              ))
            ) : (
              <p>Nothing Loaded</p>
            )}
          </div>
        </div>

        {isModalVisible && (
          <div className="absolute bottom-0 left-0 right-0 top-0 flex items-center justify-center text-black">
            <div
              className="flex h-[600px] w-[400px] flex-col items-center justify-center rounded-md bg-white outline outline-black"
              id="sellModal"
            >
              <div className="flex w-full justify-end">
                <button
                  className="text-gray font-grey -mt-10 mb-4 mr-4 bg-white"
                  onClick={() => {
                    setIsModalVisible(false);
                  }}
                >
                  X
                </button>
              </div>
              <div
                id="ModalCardImage"
                style={{
                  backgroundImage: selectedCard?.images.small
                    ? `url(${selectedCard?.images.small})`
                    : "none",
                  width: "250px",
                  height: "350px",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                className="rounded-lg outline outline-black"
              ></div>
              <div className="mt-4">
                {selectedCard?.id} | {selectedCard?.name}
              </div>
              <div className="font-bold">{selectedCard?.set.name}</div>
              <div className="flex flex-col">
                <div className="mt-2 flex rounded-md outline outline-black">
                  <label
                    htmlFor="price"
                    className="h-full rounded-bl-md rounded-tl bg-[#70b8f0] p-1"
                  >
                    Price:{" "}
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    min="0"
                    placeholder=" enter Price"
                    step="0.01"
                    className="h-full rounded-br-md rounded-tr-md outline outline-black"
                    onChange={(e) => {
                      handlePriceChange(e);
                    }}
                  />
                </div>
                <button
                  className="mt-4 w-full rounded-md bg-[#c85048] font-bold text-white hover:scale-110"
                  onClick={() => {
                    onConfirmSale();
                  }}
                >
                  CONFIRM SALE
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
