import image1 from "../assets/images/border_1.png";
import image2 from "../assets/images/border_2.png";
import image3 from "../assets/images/border_3.png";
import image4 from "../assets/images/border_4.png";
import image5 from "../assets/images/border_5.png";
import image6 from "../assets/images/border_6.png";
import image7 from "../assets/images/border_7.png";
import image8 from "../assets/images/border_8.png";
import image9 from "../assets/images/border_9.png";
import image10 from "../assets/images/border_10.png";
import image11 from "../assets/images/border_11.png";
import image12 from "../assets/images/border_12.png";
import image13 from "../assets/images/border_13.png";
import image14 from "../assets/images/border_14.png";
import image15 from "../assets/images/border_15.png";
import image16 from "../assets/images/border_16.png";
import image17 from "../assets/images/border_17.png";
import imageAll from "../assets/images/border_all.png";
import type { BorderItem } from "./types";

export const getBorderItem = (borderId: string): BorderItem | undefined => {
  return bordersItems.find(border => border.id === borderId);
};

export const bordersItems: BorderItem[] = [
{
  id: "border_sdg_1",
  name: "SDG 1 Border",
  image: image1,
  value: 10,
  valueType: "SDG 1 event participated"
},
{
id: "border_sdg_2",
  name: "SDG 2 Border",
  image: image2,
  value: 10,
  valueType: "SDG 2 event participated"
},
{
id: "border_sdg_3",
  name: "SDG 3 Border",
  image: image3,
  value: 10,
  valueType: "SDG 3 event participated"
},
{
  id: "border_sdg_4",
  name: "SDG 4 Border",
  image: image4,
  value: 10,
  valueType: "SDG 4 event participated"
},
{
  id: "border_sdg_5",
  name: "SDG 5 Border",
  image: image5,
  value: 10,
  valueType: "SDG 5 event participated"
},
{
  id: "border_sdg_6",
  name: "SDG 6 Border",
  image: image6,
  value: 10,
  valueType: "SDG 6 event participated"
},
{
  id: "border_sdg_7",
  name: "SDG 7 Border",
  image: image7,
  value: 10,
  valueType: "SDG 7 event participated"
},
{  
  id: "border_sdg_8",
  name: "SDG 8 Border",
  image: image8,
  value: 10,
  valueType: "SDG 8 event participated"
},
{
  id: "border_sdg_9",
  name: "SDG 9 Border",
  image: image9,
  value: 10,
  valueType: "SDG 9 event participated"
},
{
  id: "border_sdg_10",
  name: "SDG 10 Border",
  image: image10,
  value: 10,
  valueType: "SDG 10 event participated"
},
{
  id: "border_sdg_11",
  name: "SDG 11 Border",
  image: image11,
  value: 10,
  valueType: "SDG 11 event participated"
},
{
  id: "border_sdg_12",
  name: "SDG 12 Border",
  image: image12,
  value: 10,
  valueType: "SDG 12 event participated"
},
{
  id: "border_sdg_13",
  name: "SDG 13 Border",
  image: image13,
  value: 10,
  valueType: "SDG 13 event participated"
},
{
  id: "border_sdg_14",
  name: "SDG 14 Border",
  image: image14,
  value: 10,
  valueType: "SDG 14 event participated"
},
{
  id: "border_sdg_15",
  name: "SDG 15 Border",
  image: image15,
  value: 10,
  valueType: "SDG 15 event participated"
},
{
  id: "border_sdg_16",
  name: "SDG 16 Border",
  image: image16,
  value: 10,
  valueType: "SDG 16 event participated"
},
{
  id: "border_sdg_17",
  name: "SDG 17 Border",
  image: image17,
  value: 10,
  valueType: "SDG 17 event participated"
},
{
  id: "border_sdg_all",
  name: "All SDG Border",
  image: imageAll,
  value: 17,
  valueType: "Different SDG event participated"
},
];
