import { useRef, useState } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Select, { components, type DropdownIndicatorProps } from 'react-select';
import { Icon } from '../Icon/Icon';
import { useAppDispatch, useAppSelector } from '../../hooks/redux';
import { addMyPet } from '../../store/slices/profileSlice';
import { FirstPetCongratsModal } from '../FirstPetCongratsModal';
import styles from './AddPetForm.module.css';

const imageUrlRegex = /^https?:\/\/.*\.(?:png|jpg|jpeg|gif|bmp|webp)$/;
const birthdayRegex = /^\d{4}-\d{2}-\d{2}$/;

const schema = yup.object({
  title: yup.string().required('Title is required'),
  name: yup.string().required('Name is required'),
  imgUrl: yup
    .string()
    .matches(imageUrlRegex, 'Invalid image URL')
    .required('Image URL is required'),
  species: yup.string().required('Species is required'),
  birthday: yup
    .string()
    .matches(birthdayRegex, { message: 'Format: YYYY-MM-DD', excludeEmptyString: true })
    .required('Birthday is required'),
  sex: yup.string().required('Sex is required'),
});

const speciesValues = [
  'dog',
  'cat',
  'monkey',
  'bird',
  'snake',
  'turtle',
  'lizard',
  'frog',
  'fish',
  'ants',
  'bees',
  'butterfly',
  'spider',
  'scorpion',
] as const;

interface SpeciesOption {
  value: string;
  label: string;
}

const speciesOptions: SpeciesOption[] = speciesValues.map((species) => ({
  value: species,
  label: `${species.charAt(0).toUpperCase()}${species.slice(1)}`,
}));

export type AddPetFormValues = yup.InferType<typeof schema>;

const formatBirthdayDisplay = (value: string): string => {
  const [year, month, day] = value.split('-');
  if (!year || !month || !day) return '00.00.0000';
  return `${day}.${month}.${year}`;
};

const SpeciesDropdownIndicator = (props: DropdownIndicatorProps<SpeciesOption, false>) => (
  <components.DropdownIndicator {...props}>
    <Icon id="chevron-down" width={18} height={18} />
  </components.DropdownIndicator>
);

export const AddPetForm = (): React.ReactElement => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const isLoading = useAppSelector((state) => state.profile.isLoading);
  const [isCongratsOpen, setIsCongratsOpen] = useState(false);
  const imgUrlInputRef = useRef<HTMLInputElement | null>(null);
  const birthdayInputRef = useRef<HTMLInputElement | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors },
  } = useForm<AddPetFormValues>({
    resolver: yupResolver(schema),
    mode: 'onBlur',
    defaultValues: {
      title: '',
      name: '',
      imgUrl: '',
      species: '',
      birthday: '',
      sex: 'multiple',
    },
  });

  const selectedSex = useWatch({ control, name: 'sex' });
  const imagePreview = useWatch({ control, name: 'imgUrl' });
  const titleValue = useWatch({ control, name: 'title' });
  const nameValue = useWatch({ control, name: 'name' });
  const birthdayValue = useWatch({ control, name: 'birthday' });
  const openBirthdayPicker = (): void => {
    const input = birthdayInputRef.current;
    if (!input) return;
    input.focus();

    if ('showPicker' in HTMLInputElement.prototype) {
      (input as HTMLInputElement & { showPicker: () => void }).showPicker();
    }
  };

  const imgUrlField = register('imgUrl');
  const birthdayField = register('birthday');

  const onSubmit = async (values: AddPetFormValues): Promise<void> => {
    try {
      const updatedPets = await dispatch(
        addMyPet({
          title: values.title,
          name: values.name,
          imgURL: values.imgUrl,
          species: values.species,
          birthday: values.birthday,
          sex: values.sex,
        }),
      ).unwrap();

      // Figma flow: a special confirmation popup appears only for the very first pet.
      if (updatedPets.length === 1) {
        setIsCongratsOpen(true);
        return;
      }

      toast.success('Pet added successfully');
      navigate('/profile');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to add pet';
      toast.error(message);
    }
  };

  return (
    <>
      <form className={styles.form} onSubmit={handleSubmit(onSubmit)} noValidate>
        <input type="hidden" {...register('sex')} />
        <div className={styles.headingRow}>
          <h1 className={styles.title}>Add my pet /</h1>
          <p className={styles.subtitle}>Personal details</p>
        </div>

        <div className={styles.sexRow} role="radiogroup" aria-label="Pet sex">
          <button
            type="button"
            className={`${styles.sexButton} ${selectedSex === 'female' ? styles.sexButtonFemaleActive : styles.sexButtonFemale}`}
            onClick={() => setValue('sex', 'female', { shouldValidate: true, shouldDirty: true })}
          >
            <Icon id="female" width={20} height={20} className={styles.sexIcon} />
          </button>
          <button
            type="button"
            className={`${styles.sexButton} ${selectedSex === 'male' ? styles.sexButtonMaleActive : styles.sexButtonMale}`}
            onClick={() => setValue('sex', 'male', { shouldValidate: true, shouldDirty: true })}
          >
            <Icon id="male" width={20} height={20} className={styles.sexIcon} />
          </button>
          <button
            type="button"
            className={`${styles.sexButton} ${selectedSex === 'multiple' ? styles.sexButtonMultipleActive : styles.sexButtonMultiple}`}
            onClick={() => setValue('sex', 'multiple', { shouldValidate: true, shouldDirty: true })}
          >
            <Icon id="multiple" width={20} height={20} className={styles.sexIcon} />
          </button>
        </div>
        {errors.sex && <p className={styles.error}>{errors.sex.message}</p>}

        <div className={styles.avatarPreview}>
          {imagePreview ? (
            <img src={imagePreview} alt="Pet avatar preview" className={styles.avatarImage} />
          ) : (
            <Icon id="paw" width={34} height={34} className={styles.pawIcon} />
          )}
        </div>

        <div className={styles.urlRow}>
          <input
            {...imgUrlField}
            ref={(element) => {
              imgUrlField.ref(element);
              imgUrlInputRef.current = element;
            }}
            className={`${styles.urlInput} ${imagePreview ? styles.inputFilled : ''}`.trim()}
            placeholder="Enter URL"
            type="text"
          />
          <button
            type="button"
            className={styles.uploadButton}
            onClick={() => imgUrlInputRef.current?.focus()}
          >
            Upload photo
            <Icon id="upload-cloud" width={16} height={16} className={styles.uploadIcon} />
          </button>
        </div>
        {errors.imgUrl && <p className={styles.error}>{errors.imgUrl.message}</p>}

        <div className={styles.fields}>
          <input
            {...register('title')}
            className={`${styles.input} ${titleValue ? styles.inputFilled : ''}`.trim()}
            placeholder="Title"
            type="text"
          />
          {errors.title && <p className={styles.error}>{errors.title.message}</p>}

          <input
            {...register('name')}
            className={`${styles.input} ${nameValue ? styles.inputFilled : ''}`.trim()}
            placeholder="Pet’s Name"
            type="text"
          />
          {errors.name && <p className={styles.error}>{errors.name.message}</p>}

          <div className={styles.row}>
            <div className={styles.inlineField}>
              <input
                {...birthdayField}
                className={styles.hiddenDateInput}
                type="date"
                ref={(element) => {
                  birthdayField.ref(element);
                  birthdayInputRef.current = element;
                }}
              />
              <button
                type="button"
                className={`${styles.input} ${styles.dateDisplayButton} ${birthdayValue ? styles.inputFilled : ''}`.trim()}
                onClick={openBirthdayPicker}
                aria-label="Open date picker"
              >
                <span className={birthdayValue ? styles.dateDisplayValue : styles.dateDisplayPlaceholder}>
                  {formatBirthdayDisplay(birthdayValue ?? '')}
                </span>
                <Icon id="calendar" width={18} height={18} className={styles.calendarIcon} />
              </button>
            </div>

            <div className={styles.inlineField}>
              <Controller
                name="species"
                control={control}
                render={({ field }) => (
                  <div
                    className={`${styles.speciesSelectWrapper} ${field.value ? styles.speciesSelectFilled : ''}`.trim()}
                  >
                    <Select<SpeciesOption, false>
                      inputId="add-pet-species"
                      classNamePrefix="speciesSelect"
                      options={speciesOptions}
                      value={speciesOptions.find((option) => option.value === field.value) ?? null}
                      onChange={(option) => field.onChange(option?.value ?? '')}
                      onBlur={field.onBlur}
                      placeholder="Type of pet"
                      isSearchable={false}
                      components={{
                        IndicatorSeparator: null,
                        DropdownIndicator: SpeciesDropdownIndicator,
                      }}
                    />
                  </div>
                )}
              />
            </div>
          </div>
          {(errors.birthday || errors.species) && (
            <p className={styles.error}>
              {errors.birthday?.message ?? errors.species?.message}
            </p>
          )}
        </div>

        <div className={styles.actions}>
          <button type="button" className={styles.backButton} onClick={() => navigate('/profile')}>
            Back
          </button>
          <button type="submit" className={styles.submitButton} disabled={isLoading}>
            Submit
          </button>
        </div>
      </form>
      <FirstPetCongratsModal
        isOpen={isCongratsOpen}
        onClose={() => setIsCongratsOpen(false)}
        onGoToProfile={() => {
          setIsCongratsOpen(false);
          navigate('/profile');
        }}
      />
    </>
  );
};
