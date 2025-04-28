export const profile_names = [
  "Garfield",
  "Tinkerbell",
  "Annie",
  "Loki",
  "Cleo",
  "Angel",
  "Bob",
  "Mia",
  "Coco",
  "Gracie",
  "Bear",
  "Bella",
  "Abby",
  "Harley",
  "Cali",
  "Leo",
  "Luna",
  "Jack",
  "Felix",
  "Kiki",
];

export const profile_collections = ["notionists-neutral", "adventurer-neutral", "fun-emoji"];

const profileImgBaseUrl = "https://api.dicebear.com/6.x";

export const generateAllProfileCombinations = () => {
  const combinations = [];

  for (const collection of profile_collections) {
    for (const name of profile_names) {
      const url = `${profileImgBaseUrl}/${collection}/svg?seed=${name}`;
      combinations.push({
        collection,
        name,
        url,
      });
    }
  }

  return combinations;
};
