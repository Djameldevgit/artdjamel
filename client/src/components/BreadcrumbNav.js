// 📂 components/BreadcrumbNav.jsx
import React from 'react';
import { Breadcrumb } from 'react-bootstrap';
import { Link } from 'react-router-dom';

const BreadcrumbNav = ({ items, onItemClick }) => {
  return (
    <Breadcrumb>
      {items.map((item, index) => (
        <Breadcrumb.Item 
          key={index}
          linkAs={Link}
          linkProps={{ to: item.path }}
          active={index === items.length - 1}
          onClick={(e) => {
            e.preventDefault();
            if (onItemClick) {
              onItemClick(item.path);
            }
          }}
        >
          {item.label}
        </Breadcrumb.Item>
      ))}
    </Breadcrumb>
  );
};

export default BreadcrumbNav;