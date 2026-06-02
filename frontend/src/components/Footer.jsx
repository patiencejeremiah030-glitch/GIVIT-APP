import { Heart } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner footer-simple">
        <div className="footer-brand">
          <span className="logo-mark footer-mark">G</span>
          <div>
            <strong className="footer-title">GIVIT</strong>
            <p>Community marketplace — donate, exchange, sell locally.</p>
          </div>
        </div>
      </div>
      <p className="footer-copy">
        Made with <Heart size={14} className="inline-icon" /> for a greener community
      </p>
    </footer>
  )
}
