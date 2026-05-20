import { Sparkles } from 'lucide-react';

const AnnouncementBar = () => {
  return (
    <div className="bg-maroon text-gold py-2 px-4 text-center text-sm font-medium">
      <div className="flex items-center justify-center gap-2">
        <Sparkles className="w-4 h-4" />
        <span>Free Shipping on orders above ₹1299 | Easy 15-day returns</span>
        <Sparkles className="w-4 h-4" />
      </div>
    </div>
  );
};

export default AnnouncementBar;
