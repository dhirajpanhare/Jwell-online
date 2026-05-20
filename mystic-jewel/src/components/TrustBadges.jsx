import { Heart, Globe, Truck, Headphones } from 'lucide-react';

const TrustBadges = () => {
  const badges = [
    {
      icon: Heart,
      title: 'PROUDLY MADE IN INDIA',
      description: 'Supporting local artisans',
    },
    {
      icon: Globe,
      title: 'WORLDWIDE SHIPPING',
      description: 'We ship globally',
    },
    {
      icon: Truck,
      title: 'NO DELIVERY CHARGE!',
      description: 'Free shipping above ₹1299',
    },
    {
      icon: Headphones,
      title: 'CUSTOMER SERVICE',
      description: 'Priority support 24/7',
    },
  ];

  return (
    <div className="py-12 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, index) => {
            const Icon = badge.icon;
            return (
              <div
                key={index}
                className="flex flex-col items-center text-center p-6 rounded-lg hover:bg-offwhite transition-colors"
              >
                <div className="w-16 h-16 bg-teal/10 rounded-full flex items-center justify-center mb-4">
                  <Icon className="w-8 h-8 text-teal" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{badge.title}</h3>
                <p className="text-sm text-gray-600">{badge.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TrustBadges;
