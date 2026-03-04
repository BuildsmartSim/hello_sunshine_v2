import sharp from 'sharp';

async function censor() {
    const imagePath = 'images/photographs/community-ice-bath.jpeg';
    const outPath = 'images/photographs/community-ice-bath.jpeg'; // Overwrite

    // Create a backup first just in case
    await sharp(imagePath).toFile('images/photographs/community-ice-bath-backup.jpeg');

    // We suspect the naked person is on the right side in the background.
    // The image is 2160x3840. We will blur a large region on the middle-right.
    const region = { left: 1400, top: 800, width: 760, height: 1600 };

    try {
        const blurredRegion = await sharp(imagePath)
            .extract(region)
            .blur(40) // heavy blur
            .toBuffer();

        await sharp(imagePath)
            .composite([{ input: blurredRegion, top: region.top, left: region.left }])
            .toFile('images/photographs/community-ice-bath-censored.jpeg');

        console.log("Censored image generated at community-ice-bath-censored.jpeg");
    } catch (err) {
        console.error("Error censoring:", err);
    }
}

censor();
