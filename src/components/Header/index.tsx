import { SigninButton } from '../SigninButton';
import styles from './styles.module.scss';

export const Header =  () => {
    return (
        <header className={styles.headerContainer}>
            <div className={styles.headerContent}>
                <img src="/images/logo.svg" alt="LOGOTIPO" />
                <nav>
                    <a href="#" className={styles.active}>Home</a>
                    <a href="#">Posts</a>
                </nav>
                <SigninButton/>
            </div>
        </header>
    );
}