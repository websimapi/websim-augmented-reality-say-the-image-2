import { Fragment, jsxDEV } from "react/jsx-dev-runtime";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { createRoot } from "react-dom/client";
import { WebsimSocket } from "@websim/use-query";
import { motion, AnimatePresence } from "framer-motion";
import { householdItems } from "./items.js";
const room = new WebsimSocket();
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;
if (SpeechRecognition) {
  recognition = new SpeechRecognition();
  recognition.continuous = true;
  recognition.lang = "en-US";
  recognition.interimResults = false;
}
const App = () => {
  const [gameState, setGameState] = useState("requesting_permissions");
  const [score, setScore] = useState(0);
  const [currentItem, setCurrentItem] = useState(null);
  const [lastSpokenWord, setLastSpokenWord] = useState("");
  const videoRef = useRef(null);
  const correctAudioRef = useRef(null);
  const getPermissions = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      if (SpeechRecognition) {
        recognition.start();
      }
      setGameState("playing");
    } catch (err) {
      console.error("Error accessing media devices.", err);
      setGameState("permission_denied");
    }
  };
  const selectNewItem = useCallback(() => {
    const randomIndex = Math.floor(Math.random() * householdItems.length);
    const word = householdItems[randomIndex];
    setCurrentItem({ word, imageUrl: null, state: "loading" });
  }, []);
  useEffect(() => {
    if (gameState === "playing" && !currentItem) {
      selectNewItem();
    }
  }, [gameState, currentItem, selectNewItem]);
  useEffect(() => {
    if (currentItem && currentItem.state === "loading") {
      const fetchOrGenerateImage = async () => {
        const word = currentItem.word;
        try {
          const existing = await room.collection("items_v1").filter({ id: word }).getList();
          if (existing.length > 0 && existing[0].image_url) {
            setCurrentItem({ ...currentItem, imageUrl: existing[0].image_url, state: "ready" });
          } else {
            const result = await websim.imageGen({
              prompt: `A single ${word}, photorealistic, on a plain white background, centered`,
              transparent: true
            });
            await room.collection("items_v1").upsert({
              id: word,
              word,
              image_url: result.url
            });
            setCurrentItem({ ...currentItem, imageUrl: result.url, state: "ready" });
          }
        } catch (error) {
          console.error("Error fetching or generating image:", error);
          setTimeout(selectNewItem, 1e3);
        }
      };
      fetchOrGenerateImage();
    }
  }, [currentItem, selectNewItem]);
  useEffect(() => {
    if (!recognition) return;
    recognition.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      setLastSpokenWord(transcript);
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
    return () => {
      recognition.onresult = null;
      recognition.onerror = null;
    };
  }, []);
  useEffect(() => {
    if (currentItem && currentItem.state === "ready" && lastSpokenWord.includes(currentItem.word)) {
      setCurrentItem((prev) => ({ ...prev, state: "solved" }));
      setScore((s) => s + 1);
      if (correctAudioRef.current) {
        correctAudioRef.current.currentTime = 0;
        correctAudioRef.current.play();
      }
      setTimeout(() => {
        selectNewItem();
      }, 2e3);
    }
  }, [lastSpokenWord, currentItem, selectNewItem]);
  const renderGameState = () => {
    switch (gameState) {
      case "requesting_permissions":
        return /* @__PURE__ */ jsxDEV("div", { className: "text-center", children: [
          /* @__PURE__ */ jsxDEV("h1", { className: "text-4xl font-bold mb-4", children: "Augmented Reality: Say the Image" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 131,
            columnNumber: 25
          }),
          /* @__PURE__ */ jsxDEV("p", { className: "mb-8", children: "Allow webcam and microphone access to play." }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 132,
            columnNumber: 25
          }),
          /* @__PURE__ */ jsxDEV("button", { onClick: getPermissions, className: "bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-2xl", children: "Start Game" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 133,
            columnNumber: 25
          })
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 130,
          columnNumber: 21
        });
      case "permission_denied":
        return /* @__PURE__ */ jsxDEV("div", { className: "text-center p-8 bg-red-900/50 rounded-lg", children: [
          /* @__PURE__ */ jsxDEV("h1", { className: "text-3xl font-bold mb-4", children: "Permission Denied" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 141,
            columnNumber: 25
          }),
          /* @__PURE__ */ jsxDEV("p", { children: "You need to allow webcam and microphone access in your browser settings to play." }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 142,
            columnNumber: 25
          })
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 140,
          columnNumber: 21
        });
      case "playing":
        return /* @__PURE__ */ jsxDEV(Fragment, { children: [
          /* @__PURE__ */ jsxDEV("div", { className: "score-display", children: [
            "Score: ",
            score
          ] }, void 0, true, {
            fileName: "<stdin>",
            lineNumber: 148,
            columnNumber: 25
          }),
          /* @__PURE__ */ jsxDEV("div", { className: "conveyor-belt", children: /* @__PURE__ */ jsxDEV(AnimatePresence, { children: currentItem && /* @__PURE__ */ jsxDEV(
            motion.div,
            {
              className: "item-box",
              initial: { x: 800, opacity: 0 },
              animate: { x: 0, opacity: 1 },
              exit: { x: -800, opacity: 0 },
              transition: { duration: 1.5, type: "spring" },
              children: [
                /* @__PURE__ */ jsxDEV(AnimatePresence, { children: currentItem.state === "solved" && currentItem.imageUrl && /* @__PURE__ */ jsxDEV(
                  motion.img,
                  {
                    src: currentItem.imageUrl,
                    className: "item-image",
                    initial: { scale: 0, rotate: -180 },
                    animate: { scale: 1, rotate: 0 },
                    transition: { duration: 0.5 }
                  },
                  `${currentItem.word}-image`,
                  false,
                  {
                    fileName: "<stdin>",
                    lineNumber: 162,
                    columnNumber: 45
                  }
                ) }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 160,
                  columnNumber: 41
                }),
                currentItem.state === "loading" && /* @__PURE__ */ jsxDEV("i", { className: "fas fa-spinner fa-spin fa-3x" }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 172,
                  columnNumber: 77
                }),
                /* @__PURE__ */ jsxDEV("div", { className: "word-display", children: currentItem.word }, void 0, false, {
                  fileName: "<stdin>",
                  lineNumber: 173,
                  columnNumber: 41
                })
              ]
            },
            currentItem.word,
            true,
            {
              fileName: "<stdin>",
              lineNumber: 152,
              columnNumber: 37
            }
          ) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 150,
            columnNumber: 29
          }) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 149,
            columnNumber: 25
          }),
          currentItem?.state === "ready" && /* @__PURE__ */ jsxDEV("div", { className: "listening-indicator", children: /* @__PURE__ */ jsxDEV("i", { className: "fas fa-microphone" }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 178,
            columnNumber: 97
          }) }, void 0, false, {
            fileName: "<stdin>",
            lineNumber: 178,
            columnNumber: 60
          })
        ] }, void 0, true, {
          fileName: "<stdin>",
          lineNumber: 147,
          columnNumber: 21
        });
      default:
        return null;
    }
  };
  return /* @__PURE__ */ jsxDEV(Fragment, { children: [
    /* @__PURE__ */ jsxDEV("video", { ref: videoRef, autoPlay: true, playsInline: true, muted: true, className: "webcam-video" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 188,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("div", { className: "game-overlay", children: renderGameState() }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 189,
      columnNumber: 13
    }),
    /* @__PURE__ */ jsxDEV("audio", { ref: correctAudioRef, src: "./correct.mp3", preload: "auto" }, void 0, false, {
      fileName: "<stdin>",
      lineNumber: 192,
      columnNumber: 13
    })
  ] }, void 0, true, {
    fileName: "<stdin>",
    lineNumber: 187,
    columnNumber: 9
  });
};
const root = createRoot(document.getElementById("root"));
root.render(/* @__PURE__ */ jsxDEV(App, {}, void 0, false, {
  fileName: "<stdin>",
  lineNumber: 198,
  columnNumber: 13
}));
