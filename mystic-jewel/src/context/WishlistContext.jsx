import { createContext, useContext } from 'react';
import useWishlistHook from '../hooks/useWishlist';

const WishlistContext = createContext();

export const useWishlistContext = () => {
  const context = useContext(WishlistContext);
  if (!context) {
    throw new Error('useWishlistContext must be used within WishlistProvider');
  }
  return context;
};

// Keep useWishlist as an alias for backward compatibility (though it conflicts with hook name)
export const useWishlist = () => {
  return useWishlistContext();
};

export const WishlistProvider = ({ children }) => {
  const wishlist = useWishlistHook();

  return (
    <WishlistContext.Provider
      value={{
        wishlistItems: wishlist.wishlistItems,
        addToWishlist: wishlist.addToWishlist,
        removeFromWishlist: wishlist.removeFromWishlist,
        toggleWishlist: wishlist.toggleWishlist,
        isInWishlist: wishlist.isInWishlist,
        clearWishlist: wishlist.clearWishlist,
        loading: wishlist.loading,
        error: wishlist.error,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
};
