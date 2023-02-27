import { preclassifiedData } from "../images/validation/validation";
/* import { preclassifiedData as collectionData } from "../images/collection/validation"; */

// Define our labelmap
const labelMap: Record<number, any> = {
  1: { name: "Jogginghose", id: 1, type: "athleticType" },
  2: { name: "Joggingjacke", id: 2, type: "athleticType" },
  3: { name: "Shorts", id: 3, type: "athleticType" },
  4: { name: "Tanktop", id: 4, type: "athleticType" },
  5: { name: "Handtasche", id: 5, type: "elegantType" },
  6: { name: "Jacket/Blazer", id: 6, type: "elegantType" },
  7: { name: "Krawatte", id: 7, type: "elegantType" },
  8: { name: "Kleid", id: 8, type: "elegantType" },
  9: { name: "Mantel", id: 9, type: "elegantType" },
  10: { name: "Rock", id: 10, type: "elegantType" },
  11: { name: "Freizeithemd", id: 11, type: "casualType" },
  12: { name: "Hoodie", id: 12, type: "casualType" },
  13: { name: "HoseCasual", id: 13, type: "casualType" },
  14: { name: "JackeCasual", id: 14, type: "casualType" },
  15: { name: "Strohhut", id: 15, type: "casualType" },
  16: { name: "Sweatshirt", id: 16, type: "casualType" },
  17: { name: "TShirt", id: 17, type: "casualType" },
};

export enum CustomerSegements {
  "elegantType" = "elegantType",
  "athleticType" = "athleticType",
  "casualType" = "casualType",
}

type objectValidation = {
  object: string;
  type: CustomerSegements;
  confidence: number;
};

export const getAdvertismentByPassengerType = (type: CustomerSegements) => {
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

  if (objects.length === 0) {
    return {
      objects,
      type: { name: CustomerSegements.casualType, score: casualType },
    };
  }

  objects.forEach((el) => {
    switch (el.type) {
      case CustomerSegements.athleticType:
        athleticType += el.confidence;
        break;

      case CustomerSegements.elegantType:
        elegantType += el.confidence;
        break;

      case CustomerSegements.casualType:
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

  const scoreInPercentage = Math.round(score * 100);

  const p = document.createElement("div");
  p.setAttribute("class", "boxText");
  p.innerText = className.toUpperCase() + " (" + scoreInPercentage + "%)";
  p.style.marginLeft = -100 + "px;";
  p.style.marginTop = 0 + "px;";
  p.style.top = y * imgHeight - 20 + "px";
  p.style.left = x * imgWidth + "px";
  p.style.width = reactWidth + "px";
  p.style.zIndex = 1000 + scoreInPercentage + "";
  p.style.background = `rgba(255, 255, 255, ${0.5 + scoreInPercentage / 3})`;

  const highlighter = document.createElement("div");
  highlighter.setAttribute("class", "highlighter");
  highlighter.style.left = x * imgWidth + "px";
  highlighter.style.top = y * imgHeight + "px";
  highlighter.style.width = reactWidth + "px";
  highlighter.style.height = reactHeight + "px";
  highlighter.style.zIndex = 1000 + scoreInPercentage + "";
  highlighter.style.background = `rgba(63, 81, 181, ${
    scoreInPercentage / 100 / 3
  })`;

  box?.appendChild(highlighter);
  box?.appendChild(p);
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
  imgHeight: number,
  drawBoxes = true
) => {
  const objects: Array<objectValidation> = [];

  console.log(threshold);

  clearBoxes();

  for (let i = 0; i <= boxes.length; i++) {
    if (boxes[i] && classes[i] && scores[i] > threshold) {
      // Extract variables
      const text = classes[i];
      const className = labelMap[text]["name"];

      const score = Math.floor(scores[i] * 1000) / 1000;

      const type = labelMap[text]["type"];
      const recognizedObject = { object: className, confidence: score, type };
      objects.push(recognizedObject);

      if (drawBoxes) {
        drawBox(boxes[i], className, score, imgWidth, imgHeight);
      }
    }
  }
  return objects;
};

function importAllImages(r: any) {
  let images = {};
  r.keys().map((item: any) => {
    //@ts-ignore
    images[item.replace("./", "")] = r(item);
  });
  return images;
}

export function importImages() {
  const imagesLoaded1: Record<string, any> = importAllImages(
    require.context("../images/validation", false, /.jpg|.png|.jpeg|.webp/)
  );
  /*  const imagesLoaded2: Record<string, any> = importAllImages(
    require.context("../images/training", false, /.jpg|.png|.jpeg|.webp/)
  ); */
  /*  return { ...imagesLoaded1, ...imagesLoaded2 }; */

  return imagesLoaded1;
}

export const getPreclassifiedData = () => {
  return preclassifiedData as Record<string, CustomerSegements>;
  /*
  return { ...preclassifiedData, ...collectionData } as Record<
    string,
    CustomerSegements
  >;
  */
};

export const mapCustomerSegements = (label: CustomerSegements) => {
  const labels = {
    [CustomerSegements.athleticType]: "Athletic Passenger",
    [CustomerSegements.casualType]: "Casual Passenger",
    [CustomerSegements.elegantType]: "Business/Elegant Passenger",
  };

  return labels[label];
};
