// Define our labelmap
const labelMap: Record<number, any> = {
  1: { name: "jacket", id: 1, type: "elegantType" },
  2: { name: "krawatte", id: 2, type: "elegantType" },
  3: { name: "kleid", id: 3, type: "elegantType" },
  4: { name: "rock", id: 4, type: "elegantType" },
  5: { name: "jogginghose", id: 5, type: "athleticType" },
  6: { name: "joggingjacke", id: 6, type: "athleticType" },
  7: { name: "shorts", id: 7, type: "casualType" },
  8: { name: "tanktop", id: 8, type: "athleticType" },
  9: { name: "freizeithemd", id: 9, type: "casualType" },
  10: { name: "strohhut", id: 10, type: "casualType" },
  11: { name: "tshirt", id: 11, type: "casualType" },
};

type objectValidation = {
  object: string;
  type: "elegantType" | "athleticType" | "casualType";
  confidence: number;
};

export const getAdvertismentByPassengerType = (
  type: "elegantType" | "athleticType" | "casualType"
) => {
  const randomValue = Math.random();

  if (type === "athleticType") {
    return require("../images/ads/athleticAds1.png");
  } else if (type === "casualType") {
    return randomValue > 0.5
      ? require("../images/ads/CasualAds1.png")
      : require("../images/ads/Casual1.png");
  } else {
    return randomValue > 0.5
      ? require("../images/ads/elegantAdvertisment1.png")
      : require("../images/ads/businessAdvertisment1.png");
  }
};

export const determinePassangerType = (objects: Array<objectValidation>) => {
  let elegantType = 0;
  let athleticType = 0;
  let casualType = 0;

  objects.forEach((el) => {
    switch (el.type) {
      case "athleticType":
        athleticType += el.confidence;
        break;

      case "elegantType":
        elegantType += el.confidence;
        break;

      case "casualType":
        casualType += el.confidence;
        break;

      default:
        break;
    }
  });

  let finalType = { name: "elegantType", score: elegantType };

  if (athleticType > finalType.score) {
    finalType = { name: "athleticType", score: athleticType };
  }

  if (casualType > finalType.score) {
    finalType = { name: "casualType", score: casualType };
  }
  return { objects, type: finalType };
};

const drawBox = (
  boxes: Array<number>,
  className: string,
  score: number,
  imgWidth: number,
  imgHeight: number
) => {
  const box = document.getElementById("imageContainer");

  const [y, x, height, width] = boxes;

  const reactWidth = (width - x) * imgWidth;
  const reactHeight = (height - y) * imgHeight;

  const scoreInPercentage = Math.floor(score * 100);

  const p = document.createElement("div");
  p.setAttribute("class", "boxText");
  p.innerText = className.toUpperCase() + " (" + scoreInPercentage + "%)";
  p.style.marginLeft = -100 + "px;";
  p.style.marginTop = 0 + "px;";
  p.style.top = y * imgHeight - 20 + "px";
  p.style.left = x * imgWidth + "px";
  p.style.width = reactWidth + "px";

  const highlighter = document.createElement("div");
  highlighter.setAttribute("class", "highlighter");
  highlighter.style.left = x * imgWidth + "px";
  highlighter.style.top = y * imgHeight + "px";
  highlighter.style.width = reactWidth + "px";
  highlighter.style.height = reactHeight + "px";

  box?.appendChild(highlighter);
  box?.appendChild(p);
};

const drawReact = (
  ctx: any,
  boxes: any,
  className: string,
  score: number,
  imgWidth: number,
  imgHeight: number
) => {
  const [y, x, height, width] = boxes;

  // Set styling
  // @ts-ignore
  ctx.strokeStyle = "black";
  ctx.lineWidth = 5;
  ctx.fillStyle = "black";
  ctx.font = "30px Arial";

  // DRAW!!
  ctx.beginPath();
  // @ts-ignore
  ctx.fillText(
    className + " - " + Math.round(score * 100) / 100,
    x * imgWidth,
    y * imgHeight - 10
  );

  console.log(y, x, height, width);

  const reactWidth = (width - x) * imgWidth;
  const reactHeight = (height - y) * imgHeight;

  ctx.rect(x * imgWidth, y * imgHeight, reactWidth, reactHeight);
  ctx.stroke();
};

export const clearBoxes = () => {
  const boxes = document.getElementsByClassName(
    "highlighter"
  ) as unknown as Array<HTMLElement>;
  const texts = document.getElementsByClassName(
    "boxText"
  ) as unknown as Array<HTMLElement>;

  for (let element of boxes) {
    element.remove();
  }
  for (let element of texts) {
    element.remove();
  }
};

// Define a drawing function
export const detectObjects = (
  boxes: any,
  classes: any,
  scores: any,
  threshold: any,
  imgWidth: number,
  imgHeight: number
) => {
  const objects: Array<objectValidation> = [];

  for (let i = 0; i <= boxes.length; i++) {
    if (boxes[i] && classes[i] && scores[i] > threshold) {
      // Extract variables
      const text = classes[i];
      const className = labelMap[text]["name"];

      const score = Math.floor(scores[i] * 1000) / 1000;

      const type = labelMap[text]["type"];
      const recognizedObject = { object: className, confidence: score, type };
      objects.push(recognizedObject);

      //drawReact(ctx, boxes[i], className, score, imgWidth, imgHeight);
      drawBox(boxes[i], className, score, imgWidth, imgHeight);
    }
  }
  return objects;
};
