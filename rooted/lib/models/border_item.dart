class BorderItem {
  final String id;
  final int? idType; // Used for SDG number or rank
  final String name;
  final String image;
  final int value;
  final String valueType;

  const BorderItem({
    required this.id,
    this.idType,
    required this.name,
    required this.image,
    required this.value,
    required this.valueType,
  });
}
