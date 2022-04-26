import "./Game.css";
import { useState, useRef, useEffect } from "react";
import { v4 as uuidv4 } from 'uuid'
import { db } from "../firebase/config";
import {
  getDocs,
  query,
  where,
  collection,
  setDoc,
  doc,
  orderBy,
  limit
} from "firebase/firestore";

export function GamePage() {
  const [showMenu, setShowMenu] = useState(false);

  const [left, setLeft] = useState(0);
  const [top, setTop] = useState(0);

  const [guessed, setGuessed] = useState([]);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(0);

  const [started, setStarted] = useState(false);
  const [name, setName] = useState("");
  const [scores, setScores] = useState([]);

  let img = useRef();
  // set timer
  useEffect(() => {
    while (guessed.length !== 3 && started) {
      let myInterval = setInterval(() => {
        if (seconds < 59) {
          setSeconds(seconds + 1);
        }
        if (seconds === 59) {
          setMinutes(minutes + 1);
          setSeconds(0);
        }
      }, 1000);
      return () => {
        clearInterval(myInterval);
      };
    }
  });
  // set position for dropdown buttons
  function handleClick(e) {
    setShowMenu(true);
    // if click on right side of the page show dwopdown on the left
    if (e.pageX / img.current.offsetWidth > 0.5)  {
      setLeft(e.pageX - 100)
    } else {
      setLeft(e.pageX);
    };
    if (e.pageY / img.current.offsetHeight > 0.99) {
      setTop(e.pageY - 120) 
    } else {
         setTop(e.pageY); 
    }

  }
  // check if user select the rright spot and change background color
  function wrongOrRight(e, right, name) {
    if (right) e.target.style.backgroundColor = "green";
    if (!right) e.target.style.backgroundColor = "red";
    
    setTimeout(() => {
      setShowMenu((showMenu) => !showMenu);
      if (!guessed.includes(name) && name !== undefined)
        setGuessed([...guessed, name]);
    }, 500);
  }

  const checkCordinates = async (e, name) => {
    // get position in compared to screen size
    let positionX;
    let positionY;
    if (e.pageX / img.current.offsetWidth > 0.5)  {
      positionX = (left + 100) / img.current.offsetWidth;
    } else {
      positionX = left / img.current.offsetWidth;
    }
    if (e.pageY /img.current.offsetHeight > 0.99) {
      positionY = (top + 120) / img.current.offsetHeight;
    } else {
      positionY = top / img.current.offsetHeight;
    }
    

    try {
      const q = query(collection(db, "cords"), where("name", "==", `${name}`));
      const snaposhot = await getDocs(q);
      snaposhot.forEach((doc) => {
        const values = doc.data();
        if (
          positionY < values.Ymax &&
          positionY > values.Ymin &&
          positionX < values.Xmax &&
          positionX > values.Xmin
        ) {
          wrongOrRight(e, true, name);
        } else {
          wrongOrRight(e, false);
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  };

  const saveScore = async (name) => {
    try {
      let time = `${minutes}:${seconds}`
      if (seconds < 10)  time = `${minutes}:0${seconds}`
      if (name.length < 1 || name.length > 12) return;
      await setDoc(doc(db, "score", uuidv4()), {
        name: name,
        time: time,
      });
      setName("");
      getScores()
    } catch (error) {
      console.log(error.message);
    }
  };

  const getScores = async () => {
    try {
      let arr = []
      const q = query(collection(db, "score"), orderBy("time"), limit(5));
      const snaposhot = await getDocs(q);
      snaposhot.forEach((doc) => {
        const values = doc.data();
        if (arr.indexOf(values) === -1) arr.push(values);
      });
      setScores(arr);
    } catch (error) {
      console.log(error.message);
    }
  };

  useEffect(() => {
    getScores();
  }, []);

  return (
    <div>
      <div className="mainbar">
        <p className="time">
          {minutes}:{seconds < 10 ? `0${seconds}` : seconds}
        </p>
        <div className="character">
          <img
            src={require("../img/roger.png")}
            alt="roger"
            className={guessed.includes("roger") ? "guessed" : ""}
          />
          <img
            src={require("../img/Stewie.webp")}
            alt="stewie"
            className={guessed.includes("stewie") ? "guessed" : ""}
          />
          <img
            src={require("../img/link.png")}
            alt="link"
            className={guessed.includes("link") ? "guessed" : ""}
          />
        </div>
      </div>
        <img
          ref={img}
          src={require("../img/egor-klyuchnyk-1.2.jpg")}
          alt="game"
          onClick={(e) => handleClick(e)}
          className="game-image"
        />
        {guessed.length === 3 ? (
          <div className="screen">
            <div className="win">
              <h3>Congratulation!</h3>
              <p>
                You find all of them in {minutes}:
                {seconds < 10 ? `0${seconds}` : seconds}
              </p>
              <div className="scores">
                {scores.map((score, index) => {
                  return (
                    <div key={index} className="score">
                      <p>{index+1}:</p> <p className="name">{score.name}</p>  <p>{score.time}</p>
                    </div>
                  );
                })}
              </div>
              <div className="input-name">
                <label>Insert name:</label>
                <input
                  type="text"
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                ></input>
                <button onClick={() => saveScore(name)}>Submit</button>
              </div>
            </div>
          </div>
        ) : (
          ""
        )}
        {!started ? (
          <div className="screen">
            <div className="welcome-message">
              <h2>
                Have you ever played where's waldo? I made something similar
                with a cool picture by Egor Klyuchnyk, you will have to find 3
                character
              </h2>
              <div className="welcome-characters">
                <div className="welcome-character">
                  <img
                    src={require("../img/Stewie.webp")}
                    alt="stewie"
                    className={guessed.includes("stewie") ? "guessed" : ""}
                  />
                  <p>Stewie from the Griffin</p>
                </div>
                <div className="welcome-character">
                  <img src={require("../img/roger.png")} alt="roger" />
                  <p>Roger from American Dad</p>
                </div>
                <div className="welcome-character">
                  <img
                    src={require("../img/link.png")}
                    alt="link"
                    className={guessed.includes("link") ? "guessed" : ""}
                  />
                  <p>Link from The Legend Of Zelda</p>
                </div>
              </div>
              <h3>Good Luck!</h3>
              <button onClick={() => setStarted(true)}>PLAY</button>
            </div>
          </div>
        ) : (
          ""
        )}
        {showMenu ? (
          <div className="menu-character" style={{ top: top, left: left }}>
            <button
              className={guessed.includes("roger") ? "guessed-2" : ""}
              onClick={(e) => checkCordinates(e, "roger")}
            >
              roger
            </button>
            <button
              className={guessed.includes("stewie") ? "guessed-2" : ""}
              onClick={(e) => checkCordinates(e, "stewie")}
            >
              stewie
            </button>
            <button
              className={guessed.includes("link") ? "guessed-2" : ""}
              onClick={(e) => checkCordinates(e, "link")}
            >
              link
            </button>
          </div>
        ) : (
          ""
        )}
  
    </div>
  );
}