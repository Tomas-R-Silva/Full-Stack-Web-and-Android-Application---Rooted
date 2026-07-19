import 'dart:io';
import 'package:flutter/material.dart';
import '../data/borders_data.dart';
import '../models/border_item.dart';

class AvatarWithBorder extends StatelessWidget {
  final String? borderId;
  final String? imageUrl;
  final File? imageFile;
  final double radius;
  final double borderWidth;

  const AvatarWithBorder({
    super.key,
    this.borderId,
    this.imageUrl,
    this.imageFile,
    this.radius = 60,
    this.borderWidth = 8,
  });

  @override
  Widget build(BuildContext context) {
    final border = borderId != null ? BordersData.getBorderItem(borderId!) : null;

    return SizedBox(
      width: radius * 2.5,
      height: radius * 2.5,
      child: Stack(
        alignment: Alignment.center,
        children: [
          // Avatar
          CircleAvatar(
            radius: radius,
            backgroundColor: Colors.grey.shade200,
            backgroundImage: imageFile != null
                ? FileImage(imageFile!)
                : (imageUrl != null && imageUrl!.isNotEmpty
                    ? NetworkImage(imageUrl!)
                    : null) as ImageProvider?,
            child: (imageFile == null && (imageUrl == null || imageUrl!.isEmpty))
                ? Icon(Icons.person, size: radius, color: Colors.grey)
                : null,
          ),
          // Border
          if (border != null)
            Positioned.fill(
              child: Image.asset(
                border.image,
                fit: BoxFit.contain,
              ),
            ),
        ],
      ),
    );
  }
}
