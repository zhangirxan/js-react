import Header from './components/Header.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Interests from './components/Interests.jsx'
import Contacts from './components/Contacts.jsx'
import Footer from './components/Footer.jsx'

const profile = {
  name: 'Zhanggirkhan Askarbek',
  role: 'Frontend Developer',
  avatar: `${import.meta.env.BASE_URL}avatar.svg`,
  github: 'https://github.com/zhangirxan',
}

export default function App() {
  return (
    <>
      <Header name={profile.name} />
      <main>
        <Hero {...profile} />
        <About />
        <Interests />
        <Contacts github={profile.github} />
      </main>
      <Footer name={profile.name} />
    </>
  )
}
