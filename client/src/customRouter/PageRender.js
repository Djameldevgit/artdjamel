import React from 'react'
import { useParams } from 'react-router-dom'
import NotFound from '../components/NotFound'
import { useSelector } from 'react-redux'

const generatePage = (pageName) => {
  const component = () => require(`../pages/${pageName}`).default
  try {
    return React.createElement(component())
  } catch (err) {
    return <NotFound />
  }
}

const PageRender = () => {
  const { page, id, tab, subpage } = useParams()
  const { auth } = useSelector(state => state)

  let pageName = ""

  if (auth.token) {
    if (id) {
      if (tab) {
        // /profile/:id/:tab -> pages/profile/info
        pageName = `${page}/${tab}`
      } else {
        // /profile/:id -> pages/profile/[id]
        pageName = `${page}/[id]`
      }
    } else {
      // aquí caen users/roles, users/contactt, etc.
      // en vez de buscar solo "users", añadimos la segunda parte de la URL
      const pathname = window.location.pathname.split("/").filter(Boolean)
      if (pathname.length === 2) {
        // ejemplo: /users/roles -> ["users","roles"]
        pageName = `${pathname[0]}/${pathname[1]}`
      } else {
        pageName = `${page}`
      }
    }
  }
  
  return generatePage(pageName)
}

export default PageRender
