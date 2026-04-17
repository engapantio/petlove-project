import { PetBlock } from '../../components/PetBlock';
import { AddPetForm } from '../../components/AddPetForm';
import styles from './AddPetPage.module.css';

const AddPetPage = () => (
  <div className={styles.shell}>
    <div className={styles.grid}>
      <section className={styles.hero} aria-label="Add pet artwork">
        <PetBlock
          src="/images/Mobile-Add_pet-image.webp"
          srcSet="/images/Mobile-Add_pet-image.webp 1x, /images/Mobile-Add_pet-image@2x.webp 2x"
          sources={[
            {
              media: '(min-width: 1280px)',
              srcSet:
                '/images/Desktop-Add_pet-image.webp 1x, /images/Desktop-Add_pet-image@2x.webp 2x',
              type: 'image/webp',
            },
            {
              media: '(min-width: 768px)',
              srcSet:
                '/images/Tablet-Add_pet-image.webp 1x, /images/Tablet-Add_pet-image@2x.webp 2x',
              type: 'image/webp',
            },
            {
              media: '(max-width: 767px)',
              srcSet:
                '/images/Mobile-Add_pet-image.webp 1x, /images/Mobile-Add_pet-image@2x.webp 2x',
              type: 'image/webp',
            },
          ]}
          sizes="(min-width: 1280px) 592px, (min-width: 768px) 704px, 335px"
          alt="Owner with pet"
          width={704}
          height={654}
          className={styles.heroBlock}
        />
      </section>

      <section className={styles.panel}>
        <AddPetForm />
      </section>
    </div>
  </div>
);

export default AddPetPage;
