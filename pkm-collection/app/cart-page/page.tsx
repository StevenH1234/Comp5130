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

interface purchasedCard {
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
  buyer: string;
}

interface collectionCard {
  id: string;
  name: string;
  set: {
    name: string;
  };
  images: {
    small: string; // URL for the small image
  };
  uid: string;
}

export default function () {
  const [displayName, setDisplayName] = useState("");
  const [selectedCard, setSelectedCard] = useState<purchasedCard>();
  const [selectedCardPrice, setSelectedCardPrice] = useState<number>();
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [cardsInCart, setCardsInCart] = useState<purchasedCard[]>([]);
  const [totalPrice, setTotalPrice] = useState<number>(0);
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

  const fillPurchasedCards = async () => {
    const temp: purchasedCard[] = [];
    if (user) {
      const q = query(
        collection(db, "usersCart"),
        where("buyer", "==", user.uid),
      );

      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        querySnapshot.forEach((entry) => {
          const cardSaleData = entry.data();
          const card: purchasedCard = {
            id: cardSaleData.cardID,
            name: cardSaleData.cardName,
            set: {
              name: cardSaleData.cardSet,
            },
            images: {
              small: cardSaleData.cardImage,
            },
            price: cardSaleData.price,
            seller: cardSaleData.seller,
            buyer: cardSaleData.buyer,
          };
          temp.push(card);
        });
      }
    }
    setCardsInCart(temp);
  };

  const getTotal = () => {
    let total = 0;
    cardsInCart.forEach((entry) => {
      total += entry.price;
    });

    setTotalPrice(total);
  };

  const removeCardFromCart = (cardId: string) => {
    const temp = [...cardsInCart];

    const updatedCardsInCart = temp.filter((card) => card.id !== cardId);

    setCardsInCart(updatedCardsInCart);
  };

  const confirmPurchase = async () => {
    // remove everything from check out
    try {
      for (const entry of cardsInCart) {
        const card = {
          cardID: entry.id,
          cardName: entry.name,
          cardSet: entry.set.name,
          cardImg: entry.images.small,
          uid: entry.buyer,
        };

        const userCardCollection = collection(db, "userCards");
        await addDoc(userCardCollection, card);

        //find the document I want to delete
        const userCart = collection(db, "usersCart");
        const q = query(userCart, where("buyer", "==", entry.buyer));
        const querySnapshot = await getDocs(q);

        querySnapshot.forEach(async (snap) => {
          await deleteDoc(snap.ref);
          removeCardFromCart(card.cardID);
        });

        // delete from store
        const store = collection(db, "publicShop");
        const q2 = query(store, where("cardId", "==", entry.id)); // HANDLE IF TWO USERS SELL THE SAME
        const querySnapshot2 = await getDocs(q2);

        querySnapshot2.forEach(async (snap) => {
          await deleteDoc(snap.ref);
        });
      }
    } catch (e) {}
    // add everything removed to the usercards
  };

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

    fetchUserName();
  }, [user]);

  //   useEffect(() => {

  //   }, [user]);

  useEffect(() => {
    fillPurchasedCards();
    getTotal();
  }, [cardsInCart]);

  return (
    <div className="mx-auto h-auto min-h-screen w-[1200px] border-4 border-black bg-white text-black">
      <div className="flex items-center justify-center">
        <p className="mb-8 mt-8 pl-8 text-4xl font-bold">CheckOut</p>
      </div>
      <div className="mb-8 flex items-center justify-center">
        <hr className="border-[#a8b8c8]-500 w-[1100px] rounded-lg border-4" />
      </div>
      <div className="flex justify-center">
        <div className="center-items flex flex-col justify-center">
          {cardsInCart.length > 0 &&
            cardsInCart.map((card, index) => (
              <div
                key={index}
                className="mb-4 mt-4 flex w-[1100px] flex-row items-center justify-center rounded-lg border-4 border-black bg-[#a8b8c8]"
              >
                <div>
                  <div
                    style={{
                      backgroundImage: cardsInCart[index].images.small
                        ? `url(${cardsInCart[index].images.small})`
                        : "none",
                      width: "150px",
                      height: "210px",
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                    className="mb-4 ml-4 mr-4 mt-4 h-full items-center justify-center rounded-lg bg-[#c85048] outline outline-black"
                  ></div>
                </div>

                <div className="justify-left flex w-full pl-10">
                  <div id="card" className="flex w-full flex-col">
                    <div id="name" className="flex flex-row text-3xl">
                      <p className="mr-4 font-bold">Card Name: </p>
                      <p>{cardsInCart[index].name} </p>
                    </div>
                    <div id="set" className="flex flex-row text-3xl">
                      <p className="mr-4 font-bold">Set Name:</p>
                      <p>{cardsInCart[index].set.name}</p>
                    </div>
                    <div id="cardId" className="flex flex-row text-3xl">
                      <p className="mr-4 font-bold">Card ID: </p>
                      <p>{cardsInCart[index].id}</p>
                    </div>
                    <div id="seller" className="flex flex-row text-3xl">
                      <p className="mr-4 font-bold">Seller: </p>
                      <p>{cardsInCart[index].seller}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-row">
                  <div className="mr-4 h-[200px] w-[4px] rounded-sm bg-black"></div>
                  <div
                    id="price"
                    className="flex items-center justify-center pr-4 text-6xl font-bold"
                  >
                    ${cardsInCart[index].price}
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>
      <div className="mt-8 flex items-center justify-center">
        <hr className="border-[#a8b8c8]-500 w-[1100px] rounded-lg border-4" />
      </div>
      <div className="flex justify-center">
        <div className="mt-8 flex w-[1100px] flex-row items-center justify-between">
          <div className="text-4xl font-bold">Total: ${totalPrice}</div>
          <div>
            <button
              className="h-[60px] w-full rounded-md bg-[#70b8f0] pl-4 pr-4 font-bold text-white hover:scale-110"
              onClick={confirmPurchase}
            >
              Purchase
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
