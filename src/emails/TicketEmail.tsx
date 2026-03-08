import {
    Body,
    Container,
    Head,
    Heading,
    Hr,
    Html,
    Img,
    Link,
    Preview,
    Section,
    Text,
    Font,
} from '@react-email/components';
import * as React from 'react';

interface TicketEmailProps {
    customerName: string;
    eventTitle: string;
    passName: string;
    date: string;
    ticketId: string;
}

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://hellosunshinesauna.com';

export const TicketEmail = ({
    customerName,
    eventTitle,
    passName,
    date,
    ticketId,
}: TicketEmailProps) => {
    const viewTicketUrl = `${baseUrl}/tickets/view/${ticketId}`;

    return (
        <Html>
            <Head>
                <Font
                    fontFamily="Caveat"
                    fallbackFontFamily="cursive"
                    webFont={{
                        url: 'https://fonts.gstatic.com/s/caveat/v23/WnznHAc5bAfYB2QRah7pcpNvOx-pjRV6SII.ttf',
                        format: 'truetype',
                    }}
                    fontWeight={700}
                    fontStyle="normal"
                />
                <Font
                    fontFamily="DM Sans"
                    fallbackFontFamily="sans-serif"
                    webFont={{
                        url: 'https://fonts.gstatic.com/s/dmsans/v17/rP2tp2ywxg089UriI5-g4vlH9VoD8CmcqZG40F9JadbnoEwAopxhTg.ttf',
                        format: 'truetype',
                    }}
                    fontWeight={400}
                    fontStyle="normal"
                />
            </Head>
            <Preview>Your ticket for {eventTitle} is ready!</Preview>
            <Body style={main}>
                <Container style={container}>
                    <Section style={header}>
                        <Img
                            src={`${baseUrl}/logo-black-yellow.png`}
                            width="120"
                            alt="Hello Sunshine"
                            style={logoImage}
                        />
                    </Section>

                    <Heading style={h1}>See you soon, {customerName}</Heading>

                    <Text style={text}>
                        Your place in the heat is secured. We've prepared your digital ticket and entry instructions below.
                    </Text>

                    <Section style={ticketCard}>
                        <Text style={ticketLabel}>EVENT</Text>
                        <Text style={ticketValue}>{eventTitle}</Text>

                        <Hr style={divider} />

                        <Text style={ticketLabel}>PASS TYPE</Text>
                        <Text style={ticketValue}>{passName}</Text>

                        <Hr style={divider} />

                        <Text style={ticketLabel}>DATE</Text>
                        <Text style={ticketValue}>{date}</Text>
                    </Section>

                    <Section style={buttonContainer}>
                        <Link href={viewTicketUrl} style={button}>
                            VIEW DIGITAL TICKET
                        </Link>
                    </Section>

                    <Hr style={hr} />

                    <Section style={footer}>
                        <Text style={footerTitle}>ENTRY INSTRUCTIONS</Text>
                        <Text style={footerText}>
                            • Bring 2 towels (one to sit on, one to dry).<br />
                            • Have your digital ticket ready or save it to your photos.<br />
                        </Text>
                        <Text style={footerLogo}>HELLO SUNSHINE SAUNA</Text>
                    </Section>
                </Container>
            </Body>
        </Html>
    );
};

export default TicketEmail;

const main = {
    backgroundColor: '#F9F7F2',
    fontFamily: '"DM Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
};

const container = {
    margin: '0 auto',
    padding: '20px 0 48px',
    width: '580px',
};

const header = {
    padding: '32px 0',
    textAlign: 'center' as const,
};

const logoImage = {
    margin: '0 auto',
};

const logoText = {
    fontSize: '14px',
    fontWeight: 'bold',
    letterSpacing: '0.4em',
    color: '#2D2D2D',
    margin: '0',
};

const h1 = {
    color: '#2D2D2D',
    fontSize: '42px',
    fontWeight: '700',
    textAlign: 'center' as const,
    margin: '40px 0',
    fontFamily: '"Caveat", cursive',
};

const text = {
    color: '#2D2D2D',
    fontSize: '16px',
    lineHeight: '26px',
    textAlign: 'center' as const,
    opacity: 0.7,
    padding: '0 40px',
};

const ticketCard = {
    backgroundColor: '#ffffff',
    borderRadius: '24px',
    border: '1px solid #E5E5E5',
    padding: '40px',
    margin: '48px 20px',
};

const ticketLabel = {
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '0.2em',
    color: 'rgba(45, 45, 45, 0.4)',
    margin: '0 0 8px 0',
    textTransform: 'uppercase' as const,
};

const ticketValue = {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#2D2D2D',
    margin: '0',
    textTransform: 'uppercase' as const,
};

const divider = {
    borderColor: '#F0F0F0',
    margin: '20px 0',
};

const buttonContainer = {
    textAlign: 'center' as const,
    margin: '32px 0',
};

const button = {
    backgroundColor: '#FFB84C',
    borderRadius: '16px',
    color: '#2D2D2D',
    fontSize: '14px',
    fontWeight: 'bold',
    textDecoration: 'none',
    textAlign: 'center' as const,
    display: 'inline-block',
    padding: '20px 40px',
    letterSpacing: '0.1em',
};

const hr = {
    borderColor: '#E5E5E5',
    margin: '40px 0',
};

const footer = {
    padding: '0 20px',
};

const footerTitle = {
    fontSize: '12px',
    fontWeight: 'bold',
    letterSpacing: '0.2em',
    color: '#2D2D2D',
    margin: '0 0 16px 0',
};

const footerText = {
    fontSize: '14px',
    lineHeight: '22px',
    color: 'rgba(45, 45, 45, 0.6)',
    margin: '0 0 40px 0',
};

const footerLogo = {
    fontSize: '10px',
    fontWeight: 'bold',
    letterSpacing: '0.4em',
    color: 'rgba(45, 45, 45, 0.3)',
    textAlign: 'center' as const,
};
