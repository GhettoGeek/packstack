import * as React from 'react';
import { Formik, FormikProps } from "formik";
import * as Yup from 'yup';
import { Button } from "antd";
import DocumentTitle from 'react-document-title';

import { ProfileSpecs } from './types';

import { Input } from "app/components/FormFields";
import { alertError, alertSuccess } from "app/components/Notifications";
import PackList from 'app/components/PackList';

import { PageTitle, Box, Grid } from "styles/common";

class Profile extends React.Component<ProfileSpecs.Props, ProfileSpecs.State> {
    constructor(props: ProfileSpecs.Props) {
        super(props);
        this.state = {
            loading: true,
            packs: []
        }
    }

    componentDidMount() {
        this.fetchPacks();
    }

    fetchPacks = () => {
        const { getPacks, user: { id } } = this.props;
        this.setState({ loading: true });
        getPacks(id)
            .then(packs => {
                this.setState({ packs, loading: false })
            })
            .catch(() => {
                alertError({ message: 'Unable to retrieve profile.' });
                this.setState({ loading: false });
            });
    };

    deletePack = (id: number) => {
        this.props.deletePack(id)
            .then(() => this.fetchPacks())
            .catch(() => alertError({ message: 'Error while deleting pack.' }))
    };

    render() {
        const { user: { username, id, default_weight_unit }, updateUser, fetchUser } = this.props;
        const { loading, packs } = this.state;
        return (
            <DocumentTitle title={`Packstack | My Packs`}>
                <>
                    <PageTitle>
                        <h1>My Packs</h1>
                    </PageTitle>
                    <Grid>
                        <div className="two-thirds">
                            <h3>Packs</h3>
                            <PackList loading={loading} packs={packs} currentUserId={id} deletePack={this.deletePack}/>
                        </div>
                        <div className="third">
                            <h3>Settings</h3>
                            <Box>
                                <Formik
                                    initialValues={{ username }}
                                    validationSchema={Yup.object().shape({
                                        username: Yup.string().required("Username cannot be empty.")
                                    })}
                                    onSubmit={(values) => {
                                        updateUser(values.username, default_weight_unit)
                                            .then(() => {
                                                fetchUser();
                                                alertSuccess({ message: 'User settings updated!' });
                                            })
                                            .catch(() => alertError({ message: 'Unable to update user' }));
                                    }}>
                                    {(props: FormikProps<ProfileSpecs.SettingsForm>) => {
                                        const { values, setFieldValue, submitForm, submitCount, errors } = props;
                                        const wasSubmitted = submitCount > 0;
                                        const saveChanges = username !== values.username;

                                        return (
                                            <>
                                                <Input label="Username"
                                                       value={values.username}
                                                       error={wasSubmitted && !!errors.username}
                                                       errorMsg={errors.username}
                                                       onChange={v => setFieldValue('username', v)}/>
                                                <Button onClick={submitForm}
                                                        block={true}
                                                        type="primary"
                                                        disabled={!saveChanges}>
                                                    Save Changes
                                                </Button>
                                            </>
                                        )
                                    }}
                                </Formik>
                            </Box>
                        </div>
                    </Grid>
                </>
            </DocumentTitle>
        )
    }
}

export default Profile;