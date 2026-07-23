import '../models/border_item.dart';

class BordersData {
  static const List<BorderItem> bordersSDG = [
    BorderItem(
      id: "border_sdg_1",
      idType: 1,
      name: "SDG 1 Border",
      image: "assets/images/border_1.png",
      value: 10,
      valueType: "SDG 1 event participated",
    ),
    BorderItem(
      id: "border_sdg_2",
      idType: 2,
      name: "SDG 2 Border",
      image: "assets/images/border_2.png",
      value: 10,
      valueType: "SDG 2 event participated",
    ),
    BorderItem(
      id: "border_sdg_3",
      idType: 3,
      name: "SDG 3 Border",
      image: "assets/images/border_3.png",
      value: 10,
      valueType: "SDG 3 event participated",
    ),
    BorderItem(
      id: "border_sdg_4",
      idType: 4,
      name: "SDG 4 Border",
      image: "assets/images/border_4.png",
      value: 10,
      valueType: "SDG 4 event participated",
    ),
    BorderItem(
      id: "border_sdg_5",
      idType: 5,
      name: "SDG 5 Border",
      image: "assets/images/border_5.png",
      value: 10,
      valueType: "SDG 5 event participated",
    ),
    BorderItem(
      id: "border_sdg_6",
      idType: 6,
      name: "SDG 6 Border",
      image: "assets/images/border_6.png",
      value: 10,
      valueType: "SDG 6 event participated",
    ),
    BorderItem(
      id: "border_sdg_7",
      idType: 7,
      name: "SDG 7 Border",
      image: "assets/images/border_7.png",
      value: 10,
      valueType: "SDG 7 event participated",
    ),
    BorderItem(
      id: "border_sdg_8",
      idType: 8,
      name: "SDG 8 Border",
      image: "assets/images/border_8.png",
      value: 10,
      valueType: "SDG 8 event participated",
    ),
    BorderItem(
      id: "border_sdg_9",
      idType: 9,
      name: "SDG 9 Border",
      image: "assets/images/border_9.png",
      value: 10,
      valueType: "SDG 9 event participated",
    ),
    BorderItem(
      id: "border_sdg_10",
      idType: 10,
      name: "SDG 10 Border",
      image: "assets/images/border_10.png",
      value: 10,
      valueType: "SDG 10 event participated",
    ),
    BorderItem(
      id: "border_sdg_11",
      idType: 11,
      name: "SDG 11 Border",
      image: "assets/images/border_11.png",
      value: 10,
      valueType: "SDG 11 event participated",
    ),
    BorderItem(
      id: "border_sdg_12",
      idType: 12,
      name: "SDG 12 Border",
      image: "assets/images/border_12.png",
      value: 10,
      valueType: "SDG 12 event participated",
    ),
    BorderItem(
      id: "border_sdg_13",
      idType: 13,
      name: "SDG 13 Border",
      image: "assets/images/border_13.png",
      value: 10,
      valueType: "SDG 13 event participated",
    ),
    BorderItem(
      id: "border_sdg_14",
      idType: 14,
      name: "SDG 14 Border",
      image: "assets/images/border_14.png",
      value: 10,
      valueType: "SDG 14 event participated",
    ),
    BorderItem(
      id: "border_sdg_15",
      idType: 15,
      name: "SDG 15 Border",
      image: "assets/images/border_15.png",
      value: 10,
      valueType: "SDG 15 event participated",
    ),
    BorderItem(
      id: "border_sdg_16",
      idType: 16,
      name: "SDG 16 Border",
      image: "assets/images/border_16.png",
      value: 10,
      valueType: "SDG 16 event participated",
    ),
    BorderItem(
      id: "border_sdg_17",
      idType: 17,
      name: "SDG 17 Border",
      image: "assets/images/border_17.png",
      value: 10,
      valueType: "SDG 17 event participated",
    ),
  ];

  static const List<BorderItem> borderAll = [
    BorderItem(
      id: "border_all",
      idType: 1,
      name: "All SDG Border",
      image: "assets/images/border_all.png",
      value: 17,
      valueType: "Different SDG event participated",
    ),
  ];

  static const List<BorderItem> bordersPoints = [
    BorderItem(
      id: "border_bronze",
      idType: 1,
      name: "Bronze Border",
      image: "assets/images/border_bronze.png",
      value: 10,
      valueType: "Points",
    ),
    BorderItem(
      id: "border_silver",
      idType: 2,
      name: "Silver Border",
      image: "assets/images/border_silver.png",
      value: 50,
      valueType: "Points",
    ),
    BorderItem(
      id: "border_gold",
      idType: 3,
      name: "Gold Border",
      image: "assets/images/border_gold.png",
      value: 100,
      valueType: "Points",
    ),
    BorderItem(
      id: "border_diamond",
      idType: 4,
      name: "Diamond Border",
      image: "assets/images/border_diamond.png",
      value: 1000,
      valueType: "Points",
    ),
  ];

  static const List<BorderItem> allBorders = [
    ...bordersSDG,
    ...borderAll,
    ...bordersPoints,
  ];

  static BorderItem? getBorderItem(String borderId) {
    if (borderId.isEmpty) return null;
    try {
      return allBorders.firstWhere((b) => b.id == borderId);
    } catch (_) {
      return null;
    }
  }

  static bool isUnlocked(BorderItem border, List<int> ods, int points) {
    if (border.id.startsWith("border_sdg_")) {
      // index = idType - 1
      final index = (border.idType ?? 1) - 1;
      if (index >= 0 && index < ods.length) {
        return ods[index] >= border.value;
      }
    } else if (border.id == "border_all") {
      final differentSDGs = ods.where((count) => count > 0).length;
      return differentSDGs >= border.value;
    } else if (border.valueType == "Points") {
      return points >= border.value;
    }
    return false;
  }
}
