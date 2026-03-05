import Image, { ImageProps } from 'next/image';
import manifestData from '../../public/optimized/manifest.json';

// Cast the imported JSON to a known type for Typescript and mapping
const manifest = manifestData as Record<string, {
    webp?: string;
    jpeg?: string;
    webpLandscape?: string;
    jpegLandscape?: string;
    webpPortrait?: string;
    jpegPortrait?: string;
    altText?: string;
}>;

export interface SmartImageProps extends Omit<ImageProps, 'alt'> {
    alt?: string; // Optional override
}

/**
 * Automatically looks up the best AI-generated SEO alt text from the manifest
 * based on the image's src path.
 */
function findAltText(src: string | any): string {
    if (typeof src !== 'string') return '';

    // Search the manifest values to see if our src matches any output path
    for (const data of Object.values(manifest)) {
        if (
            src === data.webp ||
            src === data.jpeg ||
            src === data.webpLandscape ||
            src === data.jpegLandscape ||
            src === data.webpPortrait ||
            src === data.jpegPortrait
        ) {
            return data.altText || '';
        }
    }
    return '';
}

/**
 * A wrapper around next/image that automatically provides highly-descriptive SEO alt text
 * for images optimized by the Hello Sunshine optimization pipeline.
 */
export function SmartImage(props: SmartImageProps) {
    const { src, alt, ...rest } = props;

    let finalAlt = alt;

    // If no explicit alt was provided, try to find the smart SEO alt text
    if (!finalAlt) {
        finalAlt = findAltText(src);
    }

    // Fallback if not in manifest
    if (!finalAlt) {
        finalAlt = "Hello Sunshine sauna and festival sanctuary";
    }

    return <Image src={src} alt={finalAlt} {...rest} />;
}
