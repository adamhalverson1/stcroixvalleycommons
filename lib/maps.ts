function getStaticMapUrl(address: string): string {
  const encodedAddress = encodeURIComponent(address);
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY; // Make sure it's public-safe
  return `https://maps.googleapis.com/maps/api/staticmap?center=${encodedAddress}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7C${encodedAddress}&key=${apiKey}`;
}
