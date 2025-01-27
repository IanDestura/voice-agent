import Image from "next/image";

export default function Background() {
  return (
    <div className="fixed inset-0 -z-10">
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/60 z-10" />
      <Image
        src="https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=2000"
        alt="McDonald's Restaurant"
        fill
        className="object-cover"
        priority
        quality={100}
      />
    </div>
  );
}
