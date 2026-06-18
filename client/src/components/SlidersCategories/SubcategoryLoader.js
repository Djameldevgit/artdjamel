import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { getSubCategoriesByCategory } from '../../redux/actions/postAction';
 
const SubcategoryLoader = ({ categorySlug }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (categorySlug) {
      dispatch(getSubCategoriesByCategory(categorySlug));
    }
  }, [categorySlug, dispatch]);

  return null;
};

export default SubcategoryLoader;