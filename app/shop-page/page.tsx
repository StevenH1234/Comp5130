"use client";
// TODO: when logging out it does not remove the current users collection

// @ts-ignore
import pokemon from "pokemontcgsdk";
import { useState, useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "@/app/lib/fireabse";
import { useAuth } from "@/app/context/authContext";
import { BsChevronCompactLeft, BsChevronCompactRight } from "react-icons/bs";
import { toast, ToastContainer } from "react-toastify";
import {
  addDoc,
  deleteDoc,
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

interface sellingCard {
  id: string;
  name: string;
  set: {
    name: string;
  };
  images: {
    small: string; // URL for the small image
  };
  price: number;
  seller: string;
}

export default function () {
  const [cardsForSale, setCardsForSale] = useState<sellingCard[]>([]);
  const [currentUsername, setCurrentUsername] = useState("");
  const [buyIsClicked, setBuyIsClicked] = useState(false);
  const { user } = useAuth();

  const fillCardsForSale = async () => {
    const publicShop = collection(db, "publicShop");

    const querySnapshot = await getDocs(publicShop);
    const temp: sellingCard[] = [];
    querySnapshot.forEach((entry) => {
      const cardSaleData = entry.data();
      const card: sellingCard = {
        id: cardSaleData.cardId,
        name: cardSaleData.cardName,
        set: {
          name: cardSaleData.setName,
        },
        images: {
          small: cardSaleData.cardImg,
        },
        price: cardSaleData.price,
        seller: cardSaleData.seller,
      };
      temp.push(card);
    });

    setCardsForSale(temp);
  };

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

  const deleteDocByAttribute = async (id: string, value: string) => {
    try {
      const publicShopRef = collection(db, "publicShop");

      const q = query(publicShopRef, where(id, "==", value));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach(async (entrySnapShot) => {
          const entryRef = doc(db, "publicShop", entrySnapShot.id);
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

  const onBuy = async (card: sellingCard, index: number) => {
    //TODO: dont remove rightaway add to cart
    if (currentUsername != "") {
      if (card.seller != currentUsername) {
        console.log("purchasing card...");
        cardsForSale.splice(index, 1); // rid this

        const purchasedCardData = {
          buyer: user?.uid,
          cardID: card.id,
          cardName: card.name,
          cardImage: card.images.small,
          cardSet: card.set.name,
          price: card.price,
          seller: card.seller,
        };

        const userCardData = {
          uid: user?.uid,
          cardID: card.id,
          cardName: card.name,
          cardSet: card.set.name,
          cardImg: card.images.small,
        };

        const userCart = collection(db, "usersCart");
        const userCardCollection = collection(db, "userCards");

        // if already added dont add again
        const publicShopRef = doc(db, "publicShop", card.id);

        const q = query(
          userCart,
          where("cardID", "==", userCardData.cardID),
          where("uid", "==", user?.uid),
        );

        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
          await addDoc(userCart, purchasedCardData);
          console.log("added to the cart");
        } else {
          console.log("already in the list");
        }
      } else {
        console.log("you are the seller...");
      }
    }
  };

  const fetchUserName = async () => {
    if (user) {
      const displayName = await getUsername();
      if (displayName != null) {
        console.log(`DIsplay name is ${displayName}`);
        setCurrentUsername(displayName);
      } else {
        setCurrentUsername("error");
      }
    }
  };

  // useEffect(() => {
  //   fillCardsForSale();
  // }, [cardsForSale]);

  useEffect(() => {
    fetchUserName();
    console.log("getting cards");
    fillCardsForSale();
  }, []);

  return (
    <div className="mx-auto h-screen w-[1200px] border-4 border-black bg-white text-black">
      <div className="flex items-center justify-center">
        <div className="mb-8 mt-8 pl-8 text-4xl font-bold">LISTED CARDS</div>
      </div>
      <div className="mb-8 flex items-center justify-center">
        <hr className="border-[#a8b8c8]-500 w-[1100px] rounded-lg border-4" />
      </div>
      <div className="flex flex-wrap justify-center gap-14">
        {cardsForSale.length > 0 ? (
          cardsForSale.map((card, index) => (
            <div
              key={index}
              className="relative flex w-[180px] flex-col rounded-lg hover:scale-110"
            >
              <div
                style={{
                  backgroundImage: cardsForSale[index].images.small
                    ? `url(${cardsForSale[index].images.small})`
                    : "none",
                  width: "150px",
                  height: "210px",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat",
                }}
                className="mb-4 ml-4 mr-4 mt-4 h-full items-center justify-center rounded-lg bg-[#c85048] outline outline-red-500"
              ></div>

              <button
                className={
                  "w-full rounded-md bg-[#70b8f0] font-bold text-white hover:scale-110"
                }
                onClick={() => {
                  onBuy(cardsForSale[index], index);
                }}
              >
                BUY
              </button>
              <div className="mt-2 w-full max-w-[170px] break-words px-2 text-center text-sm">
                {" "}
                {cardsForSale[index].id} | {cardsForSale[index].name}
              </div>
              <div className="w-full max-w-[170px] break-words px-2 text-center text-sm font-bold">
                {" "}
                Seller: {cardsForSale[index].seller}
              </div>
              <div className="w-full max-w-[170px] break-words px-2 text-center text-sm font-bold">
                {" "}
                ${cardsForSale[index].price}
              </div>
            </div>
          ))
        ) : (
          <p>Nothing Loaded</p>
        )}
      </div>
    </div>
  );
}
